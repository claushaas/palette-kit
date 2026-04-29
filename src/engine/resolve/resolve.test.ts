import { describe, expect, it } from 'vitest';

import { createIntentRegistry } from '../../core/intent-registry.js';
import { isOklchColor, normalizeOklch } from '../../core/oklch.js';
import * as publicApi from '../../index.js';
import {
	defaultResolverConfig,
	mergeResolverConfig,
} from '../../presets/presets.js';
import { PaletteKitError } from '../../utils/errors/errors.js';
import { type ResolveColorOptions, resolveColor } from './resolve.js';

const intentRegistry = createIntentRegistry({
	brand: { chroma: 0.14, hue: 260 },
	neutral: { chroma: 0, hue: 0 },
});

const surface = normalizeOklch({ c: 0, h: 0, l: 96 });

const resolve = (options: Partial<ResolveColorOptions> = {}) =>
	resolveColor({
		intent: 'brand',
		intentRegistry,
		level: 3,
		systemDefaultContext: 'light',
		usage: 'fill',
		...options,
	});

describe('resolveColor', () => {
	it('resolves fill colors to normalized OKLCH', () => {
		const result = resolve();

		expect(isOklchColor(result.color)).toBe(true);
		expect(result.color).toEqual({
			alpha: 1,
			c: 0.14,
			h: 260,
			l: 94,
			space: 'oklch',
		});
		expect(result.axes).toEqual({
			context: 'light',
			intent: 'brand',
			level: 3,
			state: 'default',
			usage: 'fill',
		});
	});

	it('throws for unknown intents', () => {
		expect(() => resolve({ intent: 'refund' })).toThrow(
			'Unknown intent "refund". Did you forget to register it in the Intent Registry?',
		);
		expect(() => resolve({ intent: 'refund' })).toThrow(PaletteKitError);
	});

	it('throws for unknown usages', () => {
		expect(() => resolve({ usage: 'chart' })).toThrow(
			'Unknown usage "chart". Expected one of: fill, visualVocabulary, lines, overlays.',
		);
	});

	it('requires level for level-driven usages', () => {
		expect(() => resolve({ level: undefined, usage: 'fill' })).toThrow(
			'Level is required for usage "fill".',
		);
		expect(() => resolve({ level: undefined, usage: 'fill' })).toThrow(
			PaletteKitError,
		);
		expect(() => resolve({ level: undefined, usage: 'lines' })).toThrow(
			'Level is required for usage "lines".',
		);
		expect(() => resolve({ level: undefined, usage: 'overlays' })).toThrow(
			'Level is required for usage "overlays".',
		);
	});

	it('rejects level for visual vocabulary', () => {
		expect(() =>
			resolve({ level: 3, on: surface, usage: 'visualVocabulary' }),
		).toThrow('Level is not allowed for usage "visualVocabulary".');
		expect(() =>
			resolve({ level: 3, on: surface, usage: 'visualVocabulary' }),
		).toThrow(PaletteKitError);
	});

	it('requires on relation for visual vocabulary', () => {
		expect(() =>
			resolve({ level: undefined, usage: 'visualVocabulary' }),
		).toThrow('Relation "on" is required for usage "visualVocabulary".');
	});

	it('rejects on relation for overlays', () => {
		expect(() => resolve({ level: 2, on: surface, usage: 'overlays' })).toThrow(
			'Relation "on" is not allowed for usage "overlays".',
		);
	});

	it('rejects multiple relations', () => {
		expect(() => resolve({ on: surface, over: surface })).toThrow(
			'Only one relation may be provided. Received: on, over.',
		);
	});

	it('preserves lightness for the default state', () => {
		expect(resolve({ level: 4 }).color.l).toBe(91);
		expect(
			resolve({ level: 4, state: 'default', stateDirection: 'decrease' }).color
				.l,
		).toBe(91);
	});

	it('requires stateDirection for non-default states', () => {
		expect(() => resolve({ level: 4, state: 'hover' })).toThrow(
			'stateDirection is required when state is not "default".',
		);
		expect(() => resolve({ level: 4, state: 'hover' })).toThrow(
			PaletteKitError,
		);
	});

	it('validates stateDirection when it is provided for the default state', () => {
		expect(() =>
			resolve({
				state: 'default',
				stateDirection: 'sideways' as 'increase',
			}),
		).toThrow(
			'Invalid stateDirection "sideways". Expected one of: increase, decrease.',
		);
	});

	it('applies explicit state directions to lightness', () => {
		expect(
			resolve({ level: 4, state: 'hover', stateDirection: 'increase' }).color.l,
		).toBe(94);
		expect(
			resolve({ level: 4, state: 'hover', stateDirection: 'decrease' }).color.l,
		).toBe(88);
	});

	it('applies configured state alpha deltas only to overlays', () => {
		const resolverConfig = mergeResolverConfig(defaultResolverConfig, {
			stateDeltas: {
				alpha: {
					hover: 0.1,
				},
			},
		});
		const overlay = resolve({
			level: 1,
			over: surface,
			resolverConfig,
			state: 'hover',
			stateDirection: 'increase',
			usage: 'overlays',
		});
		const fill = resolve({
			resolverConfig,
			state: 'hover',
			stateDirection: 'increase',
		});

		expect(overlay.color.alpha).toBe(0.14);
		expect(fill.color.alpha).toBe(1);
	});

	it('resolves context precedence', () => {
		expect(
			resolve({
				paletteContext: 'light',
				resolverContext: 'dark',
				systemDefaultContext: 'light',
			}).axes.context,
		).toBe('dark');
		expect(
			resolve({ paletteContext: 'dark', systemDefaultContext: 'light' }).axes
				.context,
		).toBe('dark');
		expect(resolve({ systemDefaultContext: 'light' }).axes.context).toBe(
			'light',
		);
	});

	it('uses context-aware level curves', () => {
		const light = resolve({ resolverContext: 'light' });
		const dark = resolve({ resolverContext: 'dark' });

		expect(light.color.l).toBe(94);
		expect(dark.color.l).toBe(6);
		expect(dark.color.h).toBe(light.color.h);
		expect(dark.color.c).toBe(light.color.c);
		expect(dark.axes.context).toBe('dark');
	});

	it('uses overlay level curves as resolver configuration', () => {
		const overlay = resolve({
			level: 4,
			resolverConfig: mergeResolverConfig(defaultResolverConfig, {
				levelCurves: {
					overlays: () => Object.freeze({ luminanceDelta: 12 }),
				},
			}),
			usage: 'overlays',
		});

		expect(overlay.color.l).toBe(62);
	});

	it('throws when no context can be resolved', () => {
		expect(() => resolve({ systemDefaultContext: undefined })).toThrow(
			'Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.',
		);
	});

	it('is deterministic for identical inputs', () => {
		const options = {
			intent: 'brand',
			intentRegistry,
			level: 3,
			systemDefaultContext: 'light',
			usage: 'fill',
		} satisfies ResolveColorOptions;

		expect(resolveColor(options)).toEqual(resolveColor(options));
	});

	it('does not let level changes affect hue', () => {
		expect(resolve({ level: 2 }).color.h).toBe(260);
		expect(resolve({ level: 8 }).color.h).toBe(260);
	});

	it('does not let state changes affect semantic axes', () => {
		const base = resolve({ level: 4 });
		const hover = resolve({
			level: 4,
			state: 'hover',
			stateDirection: 'increase',
		});

		expect(hover.color.h).toBe(base.color.h);
		expect(hover.color.c).toBe(base.color.c);
		expect(hover.axes.usage).toBe(base.axes.usage);
		expect(hover.axes.intent).toBe(base.axes.intent);
	});

	it('freezes resolved output and axes', () => {
		const result = resolve();

		expect(Object.isFrozen(result)).toBe(true);
		expect(Object.isFrozen(result.axes)).toBe(true);
		expect(Object.isFrozen(result.color)).toBe(true);
	});

	it('does not expose resolver APIs from the public entrypoint', () => {
		expect(Object.keys(publicApi)).toEqual([
			'createPaletteKit',
			'defaultResolverConfig',
			'neutralResolverConfig',
			'softResolverConfig',
			'strongResolverConfig',
		]);
	});
});
