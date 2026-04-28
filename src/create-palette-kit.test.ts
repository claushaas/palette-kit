import { describe, expect, it } from 'vitest';

import * as publicApi from './index.js';
import {
	createPaletteKit,
	type OklchColor,
	type PaletteResolveOutput,
	type RgbaColor,
	type RgbColor,
} from './index.js';
import { PaletteKitError } from './utils/errors/errors.js';

const intents = {
	brand: { chroma: 0.14, hue: 260 },
	neutral: { chroma: 0, hue: 0 },
};

const surfaceOptions = {
	intent: 'neutral',
	level: 2,
	usage: 'fill',
} as const;

const brandFillOptions = {
	intent: 'brand',
	level: 4,
	usage: 'fill',
} as const;

describe('public Palette Kit API', () => {
	it('exports createPaletteKit as the only runtime API', () => {
		expect(Object.keys(publicApi)).toEqual(['createPaletteKit']);
	});

	it('creates an immutable palette with a resolve method', () => {
		const palette = createPaletteKit({ context: 'light', intents });

		expect(Object.isFrozen(palette)).toBe(true);
		expect(typeof palette.resolve).toBe('function');
	});

	it('returns normalized OKLCH by default', () => {
		const palette = createPaletteKit({ context: 'light', intents });
		const color = palette.resolve(brandFillOptions);

		expect(color).toEqual({
			alpha: 1,
			c: 0.14,
			h: 260,
			l: 91,
			space: 'oklch',
		} satisfies OklchColor);
	});

	it('uses palette-level output when resolver output is absent', () => {
		const palette = createPaletteKit({
			context: 'light',
			intents,
			output: 'rgba',
		});
		const color = palette.resolve(brandFillOptions);

		expect(color).toEqual({ a: 1, b: 255, g: 226, r: 170 } satisfies RgbaColor);
	});

	it('lets resolver-level output override palette output', () => {
		const palette = createPaletteKit({
			context: 'light',
			intents,
			output: 'rgba',
		});
		const color = palette.resolve({ ...brandFillOptions, output: 'hex' });

		expect(color).toBe('#aae2ff');
	});

	it('uses palette-level and resolver-level context explicitly', () => {
		const paletteContext = createPaletteKit({ context: 'light', intents });
		const systemContext = createPaletteKit({
			intents,
			systemDefaultContext: 'dark',
		});
		const resolverContext = createPaletteKit({ intents });

		expect(paletteContext.resolve(brandFillOptions).space).toBe('oklch');
		expect(systemContext.resolve(brandFillOptions).space).toBe('oklch');
		expect(
			resolverContext.resolve({ ...brandFillOptions, context: 'light' }).space,
		).toBe('oklch');
	});

	it('throws the existing context error when context cannot be resolved', () => {
		const palette = createPaletteKit({ intents });

		expect(() => palette.resolve(brandFillOptions)).toThrow(
			'Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.',
		);
		expect(() => palette.resolve(brandFillOptions)).toThrow(PaletteKitError);
	});

	it('propagates resolver misuse errors', () => {
		const palette = createPaletteKit({ context: 'light', intents });
		const surface = palette.resolve(surfaceOptions);

		expect(() =>
			palette.resolve({ ...brandFillOptions, intent: 'unknown' as 'brand' }),
		).toThrow(
			'Unknown intent "unknown". Did you forget to register it in the Intent Registry?',
		);
		expect(() =>
			palette.resolve({ ...brandFillOptions, usage: 'chart' as 'fill' }),
		).toThrow(
			'Unknown usage "chart". Expected one of: fill, visualVocabulary, lines, overlays.',
		);
		expect(() => palette.resolve({ intent: 'brand', usage: 'fill' })).toThrow(
			'Level is required for usage "fill".',
		);
		expect(() =>
			palette.resolve({
				intent: 'brand',
				level: 2,
				on: surface,
				usage: 'visualVocabulary',
			}),
		).toThrow('Level is not allowed for usage "visualVocabulary".');
		expect(() =>
			palette.resolve({ intent: 'brand', usage: 'visualVocabulary' }),
		).toThrow('Relation "on" is required for usage "visualVocabulary".');
		expect(() =>
			palette.resolve({ ...brandFillOptions, state: 'hover' }),
		).toThrow('stateDirection is required when state is not "default".');
	});

	it('accepts OKLCH results as relation targets', () => {
		const palette = createPaletteKit({ context: 'light', intents });
		const surface = palette.resolve(surfaceOptions);
		const text = palette.resolve({
			intent: 'brand',
			on: surface,
			usage: 'visualVocabulary',
		});

		expect(text).toEqual({
			alpha: 1,
			c: 0.14,
			h: 260,
			l: 50,
			space: 'oklch',
		} satisfies OklchColor);
	});

	it('supports OKLab, sRGB, and Display-P3 outputs', () => {
		const palette = createPaletteKit({ context: 'light', intents });

		expect(
			palette.resolve({ ...brandFillOptions, output: 'oklab' }).space,
		).toBe('oklab');
		expect(palette.resolve({ ...brandFillOptions, output: 'srgb' })).toEqual({
			alpha: 1,
			b: 255,
			g: 226,
			r: 170,
		} satisfies RgbColor);
		expect(palette.resolve({ ...brandFillOptions, output: 'p3' })).toEqual({
			alpha: 1,
			b: 255,
			g: 225,
			r: 182,
		} satisfies RgbColor);
	});

	it('types resolve results by default, palette-level, and resolver-level output', () => {
		const defaultPalette = createPaletteKit({ context: 'light', intents });
		const rgbaPalette = createPaletteKit({
			context: 'light',
			intents,
			output: 'rgba',
		});

		const defaultColor: PaletteResolveOutput<'oklch'> =
			defaultPalette.resolve(brandFillOptions);
		const rgbaColor: PaletteResolveOutput<'rgba'> =
			rgbaPalette.resolve(brandFillOptions);
		const srgbColor: PaletteResolveOutput<'srgb'> = rgbaPalette.resolve({
			...brandFillOptions,
			output: 'srgb',
		});
		const p3Color: PaletteResolveOutput<'p3'> = rgbaPalette.resolve({
			...brandFillOptions,
			output: 'p3',
		});
		const hexColor: PaletteResolveOutput<'hex'> = rgbaPalette.resolve({
			...brandFillOptions,
			output: 'hex',
		});

		expect(defaultColor.space).toBe('oklch');
		expect(rgbaColor.a).toBe(1);
		expect(srgbColor.alpha).toBe(1);
		expect(p3Color.alpha).toBe(1);
		expect(hexColor).toBe('#aae2ff');
	});
});
