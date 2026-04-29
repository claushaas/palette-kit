import { describe, expect, it } from 'vitest';

import { createIntentRegistry } from '../../core/intent-registry.js';
import { fillUsageStrategy } from './fill.js';
import { linesUsageStrategy } from './lines.js';
import { overlaysUsageStrategy } from './overlays.js';
import {
	assertUsage,
	getUsageStrategy,
	isUsage,
	type Usage,
	usageStrategies,
} from './strategy.js';
import { visualVocabularyUsageStrategy } from './visualVocabulary.js';

const usages = ['fill', 'visualVocabulary', 'lines', 'overlays'] as const;

const strategyCases = [
	{ strategy: fillUsageStrategy, usage: 'fill' },
	{ strategy: visualVocabularyUsageStrategy, usage: 'visualVocabulary' },
	{ strategy: linesUsageStrategy, usage: 'lines' },
	{ strategy: overlaysUsageStrategy, usage: 'overlays' },
] as const;

const unknownUsageError =
	'Unknown usage "chart". Expected one of: fill, visualVocabulary, lines, overlays.';

describe('usage validation', () => {
	it('accepts canonical usages', () => {
		for (const usage of usages) {
			expect(isUsage(usage)).toBe(true);
			expect(() => assertUsage(usage)).not.toThrow();
		}
	});

	it('rejects unknown usages and non-string values', () => {
		expect(isUsage('chart')).toBe(false);
		expect(isUsage('')).toBe(false);
		expect(isUsage(null)).toBe(false);
		expect(isUsage(1)).toBe(false);
		expect(isUsage({ usage: 'fill' })).toBe(false);
	});

	it('throws a clear error for invalid usages', () => {
		expect(() => assertUsage('chart')).toThrow(unknownUsageError);
	});
});

describe('usage strategies', () => {
	const intent = createIntentRegistry({
		brand: { chroma: 0.14, hue: 260 },
	}).intents.brand;

	it('selects a strategy by usage', () => {
		for (const { usage, strategy } of strategyCases) {
			expect(getUsageStrategy(usage)).toBe(strategy);
		}
	});

	it('returns structural results without changing intent', () => {
		for (const { usage, strategy } of strategyCases) {
			const result = strategy.resolve({ intent });

			expect(result).toEqual({ intent, usage });
			expect(result.usage).toBe(usage);
			expect(result.intent).toBe(intent);
		}
	});

	it('freezes the usage strategy registry, strategies, and results', () => {
		expect(Object.isFrozen(usageStrategies)).toBe(true);

		for (const { strategy } of strategyCases) {
			const result = strategy.resolve({ intent });

			expect(Object.isFrozen(strategy)).toBe(true);
			expect(Object.isFrozen(result)).toBe(true);
		}
	});

	it('rejects unknown usage selection without fallback', () => {
		expect(() => getUsageStrategy('chart')).toThrow(unknownUsageError);
	});

	it('keeps selected strategies typed by usage', () => {
		const fillStrategy = getUsageStrategy('fill');
		const fillUsage: Usage = fillStrategy.usage;

		expect(fillUsage).toBe('fill');
	});
});
