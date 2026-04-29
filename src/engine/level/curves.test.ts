import { describe, expect, it } from 'vitest';

import { defaultLevelCurves } from './curves.js';
import { LEVELS, type Level } from './level.js';

const fillTargets = [98, 96, 94, 91, 88, 84, 79, 73, 66];
const darkFillTargets = [2, 4, 6, 9, 12, 16, 21, 27, 34];
const linesTargets = [96, 95, 94, 92, 90, 88, 86, 84, 82];
const darkLinesTargets = [4, 5, 6, 8, 10, 12, 14, 16, 18];
const invalidLevelError = 'Invalid level "0". Expected an integer from 1 to 9.';

const valuesFor = (
	curve: (level: Level, context: 'light' | 'dark') => number,
	context: 'light' | 'dark' = 'light',
) => LEVELS.map((level) => curve(level, context));

const isStrictlyDecreasing = (values: readonly number[]) =>
	values.every((value, index) => index === 0 || value < values[index - 1]);

const isStrictlyIncreasing = (values: readonly number[]) =>
	values.every((value, index) => index === 0 || value > values[index - 1]);

describe('default level curves', () => {
	it('freezes the default curve config', () => {
		expect(Object.isFrozen(defaultLevelCurves)).toBe(true);
	});

	it('returns fill targets by level', () => {
		expect(valuesFor(defaultLevelCurves.fill)).toEqual(fillTargets);
		expect(valuesFor(defaultLevelCurves.fill, 'dark')).toEqual(darkFillTargets);
	});

	it('returns compressed lines targets by level', () => {
		expect(valuesFor(defaultLevelCurves.lines)).toEqual(linesTargets);
		expect(valuesFor(defaultLevelCurves.lines, 'dark')).toEqual(
			darkLinesTargets,
		);
	});

	it('keeps fill and lines curves monotonic decreasing', () => {
		expect(isStrictlyDecreasing(valuesFor(defaultLevelCurves.fill))).toBe(true);
		expect(isStrictlyDecreasing(valuesFor(defaultLevelCurves.lines))).toBe(
			true,
		);
	});

	it('keeps dark fill and lines curves monotonic increasing', () => {
		expect(
			isStrictlyIncreasing(valuesFor(defaultLevelCurves.fill, 'dark')),
		).toBe(true);
		expect(
			isStrictlyIncreasing(valuesFor(defaultLevelCurves.lines, 'dark')),
		).toBe(true);
	});

	it('compresses lines variation relative to fill', () => {
		const fillVariation =
			defaultLevelCurves.fill(1, 'light') - defaultLevelCurves.fill(9, 'light');
		const linesVariation =
			defaultLevelCurves.lines(1, 'light') -
			defaultLevelCurves.lines(9, 'light');

		expect(linesVariation).toBeLessThan(fillVariation);
	});

	it('returns frozen overlay targets with monotonic increasing luminance deltas', () => {
		const overlayResults = LEVELS.map((level) =>
			defaultLevelCurves.overlays(level, 'light'),
		);

		expect(overlayResults.map((result) => result.luminanceDelta)).toEqual(
			LEVELS,
		);
		expect(overlayResults.every((result) => Object.isFrozen(result))).toBe(
			true,
		);
	});

	it('rejects invalid levels without fallback', () => {
		expect(() => defaultLevelCurves.fill(0 as Level, 'light')).toThrow(
			invalidLevelError,
		);
		expect(() => defaultLevelCurves.lines(0 as Level, 'light')).toThrow(
			invalidLevelError,
		);
		expect(() => defaultLevelCurves.overlays(0 as Level, 'light')).toThrow(
			invalidLevelError,
		);
	});

	it('does not define visual vocabulary level curves', () => {
		expect(Object.hasOwn(defaultLevelCurves, 'visualVocabulary')).toBe(false);
	});
});
