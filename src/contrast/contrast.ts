import { APCAcontrast, sRGBtoY } from 'apca-w3';

import { normalizeOklch, type OklchColor } from '../core/oklch.js';
import type { Context } from '../engine/context/context.js';
import { serializeOklchToSrgb } from '../export/serialize.js';
import type { ChromaConfig, RelationParamsConfig } from '../presets/presets.js';
import { createContrastUnsatisfiableError } from '../utils/errors/errors.js';

export type ContrastResolutionConfig = Readonly<{
	on: RelationParamsConfig['on'];
	chromaLimits: ChromaConfig;
}>;

export type ContrastResolutionInput = Readonly<{
	color: OklchColor;
	target: OklchColor;
	context: Context;
	config: ContrastResolutionConfig;
}>;

const LIGHTNESS_STEP = 0.5;
const CONTRAST_PRECISION = 2;

const clampLightness = (value: number) => Math.min(100, Math.max(0, value));

const roundContrast = (contrast: number) =>
	Number(contrast.toFixed(CONTRAST_PRECISION));

export function measureApcaContrast(
	foreground: OklchColor,
	background: OklchColor,
): number {
	const foregroundRgb = serializeOklchToSrgb(foreground);
	const backgroundRgb = serializeOklchToSrgb(background);
	const contrast = APCAcontrast(
		sRGBtoY([foregroundRgb.r, foregroundRgb.g, foregroundRgb.b]),
		sRGBtoY([backgroundRgb.r, backgroundRgb.g, backgroundRgb.b]),
	);

	const numericContrast =
		typeof contrast === 'number' ? contrast : Number(contrast);

	if (Number.isFinite(numericContrast)) {
		return numericContrast;
	}

	const wcagContrast = measureWcagContrast(foreground, background);
	const polarity = foreground.l <= background.l ? 1 : -1;
	return polarity * wcagContrast * 10;
}

const channelToLinear = (channel: number) => {
	const normalized = channel / 255;
	return normalized <= 0.03928
		? normalized / 12.92
		: ((normalized + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (color: OklchColor) => {
	const rgb = serializeOklchToSrgb(color);

	return (
		0.2126 * channelToLinear(rgb.r) +
		0.7152 * channelToLinear(rgb.g) +
		0.0722 * channelToLinear(rgb.b)
	);
};

export function measureWcagContrast(
	foreground: OklchColor,
	background: OklchColor,
): number {
	const foregroundLuminance = relativeLuminance(foreground);
	const backgroundLuminance = relativeLuminance(background);
	const lighter = Math.max(foregroundLuminance, backgroundLuminance);
	const darker = Math.min(foregroundLuminance, backgroundLuminance);

	return (lighter + 0.05) / (darker + 0.05);
}

const hasTargetContrast = (contrast: number, target: number) =>
	Math.abs(contrast) >= target;

const createCandidate = (
	color: OklchColor,
	lightness: number,
	chroma: number,
): OklchColor =>
	normalizeOklch({
		alpha: color.alpha,
		c: Math.max(0, chroma),
		h: color.h,
		l: clampLightness(lightness),
	});

type ContrastDirection = 'increase' | 'decrease';

const selectContrastDirections = (
	target: OklchColor,
	context: Context,
): readonly ContrastDirection[] => {
	if (target.l < 45) {
		return ['increase', 'decrease'];
	}

	if (target.l > 55) {
		return ['decrease', 'increase'];
	}

	return context === 'dark'
		? ['increase', 'decrease']
		: ['decrease', 'increase'];
};

const scanLightness = (
	color: OklchColor,
	target: OklchColor,
	chroma: number,
	direction: ContrastDirection,
	maxLuminanceShift: number,
	contrastTarget: number,
) => {
	const signedStep =
		direction === 'increase' ? LIGHTNESS_STEP : -LIGHTNESS_STEP;
	const iterations = Math.ceil(maxLuminanceShift / LIGHTNESS_STEP);
	let bestColor = createCandidate(color, color.l, chroma);
	let bestContrast = measureApcaContrast(bestColor, target);

	for (let index = 0; index <= iterations; index += 1) {
		const lightness = color.l + signedStep * index;
		const shift = Math.abs(lightness - color.l);

		if (shift > maxLuminanceShift) {
			break;
		}

		const candidate = createCandidate(color, lightness, chroma);
		const contrast = measureApcaContrast(candidate, target);

		if (Math.abs(contrast) > Math.abs(bestContrast)) {
			bestColor = candidate;
			bestContrast = contrast;
		}

		if (hasTargetContrast(contrast, contrastTarget)) {
			break;
		}
	}

	return { bestColor, bestContrast };
};

export function resolveOnContrast({
	color,
	config,
	context,
	target,
}: ContrastResolutionInput): OklchColor {
	const contrastTarget = config.on.contrastTarget;
	const maxReduction = Math.min(
		color.c,
		color.c * config.chromaLimits.maxReduction,
	);
	const chromaStep = config.chromaLimits.reductionStep;
	let bestContrast = measureApcaContrast(color, target);

	if (hasTargetContrast(bestContrast, contrastTarget)) {
		return Object.freeze(color);
	}

	for (
		let reduction = 0;
		reduction <= maxReduction + chromaStep / 2;
		reduction += chromaStep
	) {
		const chroma = Math.max(0, color.c - reduction);
		for (const direction of selectContrastDirections(target, context)) {
			const result = scanLightness(
				color,
				target,
				chroma,
				direction,
				config.on.maxLuminanceShift,
				contrastTarget,
			);

			if (Math.abs(result.bestContrast) > Math.abs(bestContrast)) {
				bestContrast = result.bestContrast;
			}

			if (hasTargetContrast(result.bestContrast, contrastTarget)) {
				return Object.freeze(result.bestColor);
			}
		}
	}

	throw createContrastUnsatisfiableError(
		roundContrast(Math.abs(bestContrast)),
		contrastTarget,
	);
}
