import { describe, expect, it } from 'vitest';

import { createIntentRegistry } from './core/intent-registry.js';
import {
	type ResolveColorOptions,
	resolveColor,
} from './engine/resolve/resolve.js';
import { serializeColor } from './export/serialize.js';
import type { OklchColor } from './index.js';
import { createPaletteKit } from './index.js';

const intents = {
	brand: { chroma: 0.14, hue: 260 },
	neutral: { chroma: 0, hue: 0 },
	success: { chroma: 0.12, hue: 145 },
};

const intentRegistry = createIntentRegistry(intents);
const lightPalette = createPaletteKit({ context: 'light', intents });
const darkPalette = createPaletteKit({ context: 'dark', intents });

const resolveInternal = (options: Partial<ResolveColorOptions> = {}) =>
	resolveColor({
		intent: 'brand',
		intentRegistry,
		level: 3,
		systemDefaultContext: 'light',
		usage: 'fill',
		...options,
	});

const surface = lightPalette.resolve({
	intent: 'neutral',
	level: 2,
	usage: 'fill',
});

const fillGoldenOptions = {
	intent: 'brand',
	level: 3,
	usage: 'fill',
} as const;

const visualVocabularyGoldenOptions = {
	intent: 'brand',
	on: surface,
	usage: 'visualVocabulary',
} as const;

const linesGoldenOptions = {
	intent: 'neutral',
	level: 2,
	on: surface,
	usage: 'lines',
} as const;

const overlaysGoldenOptions = {
	intent: 'neutral',
	level: 1,
	under: surface,
	usage: 'overlays',
} as const;

const goldenCases = [
	{
		expected: Object.freeze({
			alpha: 1,
			c: 0.14,
			h: 260,
			l: 94,
			space: 'oklch',
		} satisfies OklchColor),
		name: 'solid surface',
		options: fillGoldenOptions,
	},
	{
		expected: Object.freeze({
			alpha: 1,
			c: 0.14,
			h: 260,
			l: 50,
			space: 'oklch',
		} satisfies OklchColor),
		name: 'visual vocabulary',
		options: visualVocabularyGoldenOptions,
	},
	{
		expected: Object.freeze({
			alpha: 1,
			c: 0,
			h: 0,
			l: 95,
			space: 'oklch',
		} satisfies OklchColor),
		name: 'divider line',
		options: linesGoldenOptions,
	},
	{
		expected: Object.freeze({
			alpha: 1,
			c: 0,
			h: 0,
			l: 50,
			space: 'oklch',
		} satisfies OklchColor),
		name: 'overlay',
		options: overlaysGoldenOptions,
	},
] as const;

describe('golden cases', () => {
	it.each(goldenCases)('locks the $name golden output', ({
		options,
		expected,
	}) => {
		expect(lightPalette.resolve(options)).toEqual(expected);
	});

	it('locks representative failure cases', () => {
		expect(() =>
			lightPalette.resolve({
				intent: 'brand',
				usage: 'visualVocabulary',
			}),
		).toThrow('Relation "on" is required for usage "visualVocabulary".');

		expect(() =>
			lightPalette.resolve({
				intent: 'brand',
				usage: 'fill',
			}),
		).toThrow('Level is required for usage "fill".');
	});
});

describe('determinism invariants', () => {
	it('returns equal public outputs for repeated identical calls', () => {
		const first = lightPalette.resolve(fillGoldenOptions);
		const second = lightPalette.resolve(fillGoldenOptions);

		expect(second).toEqual(first);
	});

	it('returns equal internal outputs for repeated identical calls', () => {
		const options = {
			intent: 'brand',
			intentRegistry,
			level: 3,
			systemDefaultContext: 'light',
			usage: 'fill',
		} satisfies ResolveColorOptions;

		expect(resolveColor(options)).toEqual(resolveColor(options));
	});

	it('does not depend on prior call order', () => {
		const before = lightPalette.resolve(fillGoldenOptions);

		lightPalette.resolve(visualVocabularyGoldenOptions);
		lightPalette.resolve(linesGoldenOptions);
		lightPalette.resolve(overlaysGoldenOptions);
		darkPalette.resolve({ ...fillGoldenOptions, context: 'light' });

		expect(lightPalette.resolve(fillGoldenOptions)).toEqual(before);
	});

	it('keeps repeated golden cases stable', () => {
		for (const { options, expected } of goldenCases) {
			expect(lightPalette.resolve(options)).toEqual(expected);
			expect(lightPalette.resolve(options)).toEqual(expected);
			expect(lightPalette.resolve(options)).toEqual(expected);
		}
	});

	it('preserves frozen objects for object outputs', () => {
		expect(Object.isFrozen(lightPalette.resolve(fillGoldenOptions))).toBe(true);
		expect(
			Object.isFrozen(
				lightPalette.resolve({ ...fillGoldenOptions, output: 'rgba' }),
			),
		).toBe(true);
	});
});

describe('output independence invariants', () => {
	it('keeps internal OKLCH independent from requested public output', () => {
		const internal = resolveInternal(fillGoldenOptions).color;

		expect(lightPalette.resolve(fillGoldenOptions)).toEqual(internal);
		expect(lightPalette.resolve({ ...fillGoldenOptions, output: 'hex' })).toBe(
			serializeColor(internal, 'hex'),
		);
		expect(
			lightPalette.resolve({ ...fillGoldenOptions, output: 'rgba' }),
		).toEqual(serializeColor(internal, 'rgba'));
	});

	it('does not let output change semantic errors', () => {
		expect(() =>
			lightPalette.resolve({
				...fillGoldenOptions,
				intent: 'unknown' as 'brand',
				output: 'hex',
			}),
		).toThrow(
			'Unknown intent "unknown". Did you forget to register it in the Intent Registry?',
		);

		expect(() =>
			lightPalette.resolve({
				intent: 'brand',
				output: 'hex',
				usage: 'fill',
			}),
		).toThrow('Level is required for usage "fill".');

		expect(() =>
			lightPalette.resolve({
				intent: 'brand',
				output: 'hex',
				usage: 'visualVocabulary',
			}),
		).toThrow('Relation "on" is required for usage "visualVocabulary".');
	});
});

describe('axis isolation invariants', () => {
	it('lets level change lightness without changing hue or chroma', () => {
		const lowerLevel = resolveInternal({ level: 2 });
		const higherLevel = resolveInternal({ level: 8 });

		expect(higherLevel.color.l).not.toBe(lowerLevel.color.l);
		expect(higherLevel.color.h).toBe(lowerLevel.color.h);
		expect(higherLevel.color.c).toBe(lowerLevel.color.c);
	});

	it('lets state change lightness without changing semantic axes', () => {
		const base = resolveInternal({ level: 4 });
		const hover = resolveInternal({
			level: 4,
			state: 'hover',
			stateDirection: 'increase',
		});

		expect(hover.color.l).not.toBe(base.color.l);
		expect(hover.color.h).toBe(base.color.h);
		expect(hover.color.c).toBe(base.color.c);
		expect(hover.axes.usage).toBe(base.axes.usage);
		expect(hover.axes.intent).toBe(base.axes.intent);
	});

	it('does not let context alter OKLCH while context hooks are structural', () => {
		const light = resolveInternal({ resolverContext: 'light' });
		const dark = resolveInternal({ resolverContext: 'dark' });

		expect(dark.color).toEqual(light.color);
		expect(dark.axes.context).toBe('dark');
		expect(light.axes.context).toBe('light');
		expect(dark.axes.intent).toBe(light.axes.intent);
		expect(dark.axes.usage).toBe(light.axes.usage);
	});

	it('does not let relation targets change usage or intent metadata', () => {
		const fill = resolveInternal({ on: surface });
		const visualVocabulary = resolveInternal({
			level: undefined,
			on: surface,
			usage: 'visualVocabulary',
		});
		const overlayOver = resolveInternal({
			level: 1,
			over: surface,
			usage: 'overlays',
		});
		const overlayUnder = resolveInternal({
			level: 1,
			under: surface,
			usage: 'overlays',
		});

		expect(fill.axes.usage).toBe('fill');
		expect(fill.axes.intent).toBe('brand');
		expect(visualVocabulary.axes.usage).toBe('visualVocabulary');
		expect(visualVocabulary.axes.intent).toBe('brand');
		expect(overlayOver.axes.usage).toBe('overlays');
		expect(overlayOver.axes.intent).toBe('brand');
		expect(overlayUnder.axes.usage).toBe('overlays');
		expect(overlayUnder.axes.intent).toBe('brand');
	});
});
