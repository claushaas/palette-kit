import { describe, expect, it } from 'vitest';

import { normalizeOklch } from '../core/oklch.js';
import { createPaletteKit } from '../index.js';
import { PaletteKitError } from '../utils/errors/errors.js';
import {
	measureApcaContrast,
	measureWcagContrast,
	resolveOnContrast,
} from './contrast.js';

const intents = {
	brand: { chroma: 0.14, hue: 260 },
	neutral: { chroma: 0, hue: 0 },
};

describe('APCA contrast resolution', () => {
	it('resolves visual vocabulary on a target to the default APCA target', () => {
		const palette = createPaletteKit({ context: 'light', intents });
		const surface = palette.resolve({
			intent: 'neutral',
			level: 2,
			usage: 'fill',
		});
		const text = palette.resolve({
			intent: 'brand',
			on: surface,
			usage: 'visualVocabulary',
		});

		expect(Math.abs(measureApcaContrast(text, surface))).toBeGreaterThanOrEqual(
			60,
		);
		expect(text.h).toBe(260);
		expect(text.alpha).toBe(1);
	});

	it('preserves chroma when luminance alone satisfies contrast', () => {
		const palette = createPaletteKit({ context: 'light', intents });
		const surface = palette.resolve({
			intent: 'neutral',
			level: 2,
			usage: 'fill',
		});
		const text = palette.resolve({
			intent: 'brand',
			on: surface,
			usage: 'visualVocabulary',
		});

		expect(text.c).toBe(0.14);
	});

	it('fails explicitly when the configured APCA target cannot be satisfied', () => {
		const color = normalizeOklch({ c: 0.4, h: 260, l: 50 });
		const target = normalizeOklch({ c: 0, h: 0, l: 50 });

		expect(() =>
			resolveOnContrast({
				color,
				config: {
					chromaLimits: { maxReduction: 1, reductionStep: 0.01 },
					on: { contrastTarget: 80, maxLuminanceShift: 0 },
				},
				context: 'light',
				target,
			}),
		).toThrow(PaletteKitError);
		expect(() =>
			resolveOnContrast({
				color,
				config: {
					chromaLimits: { maxReduction: 1, reductionStep: 0.01 },
					on: { contrastTarget: 80, maxLuminanceShift: 0 },
				},
				context: 'light',
				target,
			}),
		).toThrow('Unable to satisfy APCA contrast target 80.');
	});

	it('exposes WCAG contrast as a finite fallback diagnostic', () => {
		const black = normalizeOklch({ c: 0, h: 0, l: 0 });
		const white = normalizeOklch({ c: 0, h: 0, l: 100 });

		expect(measureWcagContrast(black, white)).toBeGreaterThan(20);
	});

	it('uses context to choose contrast direction for ambiguous targets', () => {
		const color = normalizeOklch({ c: 0.14, h: 260, l: 50 });
		const target = normalizeOklch({ c: 0, h: 0, l: 50 });
		const config = {
			chromaLimits: { maxReduction: 1, reductionStep: 0.01 },
			on: { contrastTarget: 10, maxLuminanceShift: 30 },
		};

		const lightContext = resolveOnContrast({
			color,
			config,
			context: 'light',
			target,
		});
		const darkContext = resolveOnContrast({
			color,
			config,
			context: 'dark',
			target,
		});

		expect(lightContext.l).toBeLessThan(50);
		expect(darkContext.l).toBeGreaterThan(50);
	});

	it('keeps output format independent from semantic contrast errors', () => {
		const palette = createPaletteKit({
			context: 'light',
			intents,
			resolverConfig: {
				relationParams: {
					on: { contrastTarget: 80, maxLuminanceShift: 0 },
				},
			},
		});
		const target = normalizeOklch({ c: 0, h: 0, l: 50 });

		expect(() =>
			palette.resolve({
				intent: 'brand',
				on: target,
				output: 'hex',
				usage: 'visualVocabulary',
			}),
		).toThrow('Unable to satisfy APCA contrast target 80.');
		expect(() =>
			palette.resolve({
				intent: 'brand',
				on: target,
				output: 'rgba',
				usage: 'visualVocabulary',
			}),
		).toThrow('Unable to satisfy APCA contrast target 80.');
	});
});
