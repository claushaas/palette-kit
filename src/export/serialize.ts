import { normalizeOklch, type OklchInput } from '../core/oklch.js';
import { oklabToLinearRgb, oklchToOklab } from '../operators/convert.js';
import { createUnsupportedOutputError } from '../utils/errors/errors.js';
import type { ColorOutput, RgbaColor, RgbColor } from './types.js';

export type GamutStrategy = 'clip';

export type SerializationOptions = Readonly<{
	gamutStrategy?: GamutStrategy;
}>;

export type ColorSerializer<T> = (
	color: OklchInput,
	options?: SerializationOptions,
) => T;

const DEFAULT_GAMUT_STRATEGY = 'clip' satisfies GamutStrategy;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

const toSrgbChannel = (linearChannel: number) => {
	const encoded =
		linearChannel <= 0.0031308
			? 12.92 * linearChannel
			: 1.055 * linearChannel ** (1 / 2.4) - 0.055;

	return Math.round(clampUnit(encoded) * 255);
};

const toEncodedRgbColor = (
	linearRgb: Readonly<{ r: number; g: number; b: number; alpha: number }>,
): RgbColor =>
	Object.freeze({
		alpha: linearRgb.alpha,
		b: toSrgbChannel(linearRgb.b),
		g: toSrgbChannel(linearRgb.g),
		r: toSrgbChannel(linearRgb.r),
	});

const oklabToLinearDisplayP3 = (
	oklab: ReturnType<typeof oklchToOklab>,
): Readonly<{ r: number; g: number; b: number; alpha: number }> => {
	const lPrime = oklab.l + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b;
	const mPrime = oklab.l - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b;
	const sPrime = oklab.l - 0.0894841775 * oklab.a - 1.291485548 * oklab.b;

	const l = lPrime ** 3;
	const m = mPrime ** 3;
	const s = sPrime ** 3;

	const x = 1.2270138511 * l - 0.5577999807 * m + 0.281256149 * s;
	const y = -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s;
	const z = -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s;

	return {
		alpha: oklab.alpha,
		b: 0.0358458302 * x - 0.0761723893 * y + 0.956884524 * z,
		g: -0.8294889696 * x + 1.7626640603 * y + 0.0236246858 * z,
		r: 2.4934969119 * x - 0.9313836179 * y - 0.4027107845 * z,
	};
};

const toHexChannel = (channel: number) => channel.toString(16).padStart(2, '0');

const resolveGamutStrategy = (options: SerializationOptions | undefined) => {
	const strategy = options?.gamutStrategy ?? DEFAULT_GAMUT_STRATEGY;

	if (strategy !== 'clip') {
		throw new Error(
			`Unsupported gamut strategy "${String(strategy)}". Expected "clip".`,
		);
	}

	return strategy;
};

export const serializeOklchToRgba: ColorSerializer<RgbaColor> = (
	input,
	options,
) => {
	const srgb = serializeOklchToSrgb(input, options);

	return Object.freeze({
		a: srgb.alpha,
		b: srgb.b,
		g: srgb.g,
		r: srgb.r,
	});
};

export const serializeOklchToOklab: ColorSerializer<
	ReturnType<typeof oklchToOklab>
> = (input) => oklchToOklab(input);

export const serializeOklchToSrgb: ColorSerializer<RgbColor> = (
	input,
	options,
) => {
	resolveGamutStrategy(options);

	const color = normalizeOklch(input);
	const linearRgb = oklabToLinearRgb(oklchToOklab(color));

	return toEncodedRgbColor(linearRgb);
};

export const serializeOklchToP3: ColorSerializer<RgbColor> = (
	input,
	options,
) => {
	resolveGamutStrategy(options);

	const color = normalizeOklch(input);
	const linearP3 = oklabToLinearDisplayP3(oklchToOklab(color));

	return toEncodedRgbColor(linearP3);
};

export const serializeOklchToHex: ColorSerializer<string> = (
	input,
	options,
) => {
	const rgba = serializeOklchToRgba(input, options);

	return `#${toHexChannel(rgba.r)}${toHexChannel(rgba.g)}${toHexChannel(rgba.b)}`;
};

export function serializeColor(
	color: OklchInput,
	output: ColorOutput,
	options?: SerializationOptions,
): ReturnType<
	| typeof normalizeOklch
	| typeof serializeOklchToOklab
	| typeof serializeOklchToSrgb
	| typeof serializeOklchToP3
	| typeof serializeOklchToHex
	| typeof serializeOklchToRgba
> {
	if (output === 'oklch') {
		return normalizeOklch(color);
	}

	if (output === 'oklab') {
		return serializeOklchToOklab(color);
	}

	if (output === 'srgb') {
		return serializeOklchToSrgb(color, options);
	}

	if (output === 'p3') {
		return serializeOklchToP3(color, options);
	}

	if (output === 'hex') {
		return serializeOklchToHex(color, options);
	}

	if (output === 'rgba') {
		return serializeOklchToRgba(color, options);
	}

	throw createUnsupportedOutputError(output);
}
