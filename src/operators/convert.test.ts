import { describe, expect, it } from 'vitest';

import {
	CONVERSION_EPSILON,
	linearRgbToOklab,
	oklabToLinearRgb,
	oklabToOklch,
	oklchToOklab,
} from './convert.js';

const ROUND_TRIP_EPSILON = 1e-7;

const expectCloseTo = (actual: number, expected: number) => {
	expect(Math.abs(actual - expected)).toBeLessThanOrEqual(ROUND_TRIP_EPSILON);
};

describe('OKLCH and OKLab conversions', () => {
	it('converts neutral OKLCH to OKLab', () => {
		expect(oklchToOklab({ c: 0, h: 260, l: 50 })).toEqual({
			a: 0,
			alpha: 1,
			b: 0,
			l: 0.5,
			space: 'oklab',
		});
	});

	it('round-trips OKLCH through OKLab within tolerance', () => {
		const source = { alpha: 0.72, c: 0.142, h: 278.4, l: 63.5 };
		const result = oklabToOklch(oklchToOklab(source));

		expectCloseTo(result.l, source.l);
		expectCloseTo(result.c, source.c);
		expectCloseTo(result.h, source.h);
		expectCloseTo(result.alpha, source.alpha);
	});

	it('preserves alpha across OKLCH and OKLab conversions', () => {
		expect(oklchToOklab({ alpha: 0.42, c: 0.1, h: 30, l: 50 }).alpha).toBe(
			0.42,
		);
		expect(oklabToOklch({ a: 0.1, alpha: 0.42, b: 0.2, l: 0.5 }).alpha).toBe(
			0.42,
		);
	});

	it('rejects non-finite OKLab channels', () => {
		expect(() => oklabToOklch({ a: 0, b: 0, l: Number.NaN })).toThrow(
			'OKLab l must be a finite number.',
		);
		expect(() =>
			oklabToOklch({ a: Number.POSITIVE_INFINITY, b: 0, l: 0.5 }),
		).toThrow('OKLab a must be a finite number.');
		expect(() =>
			oklabToOklch({ a: 0, b: Number.NEGATIVE_INFINITY, l: 0.5 }),
		).toThrow('OKLab b must be a finite number.');
	});
});

describe('OKLab and linear RGB conversions', () => {
	it('round-trips OKLab through linear RGB within tolerance', () => {
		const source = { a: 0.08, alpha: 0.8, b: -0.12, l: 0.64 };
		const result = linearRgbToOklab(oklabToLinearRgb(source));

		expectCloseTo(result.l, source.l);
		expectCloseTo(result.a, source.a);
		expectCloseTo(result.b, source.b);
		expectCloseTo(result.alpha, source.alpha);
	});

	it('preserves alpha across OKLab and linear RGB conversions', () => {
		expect(
			oklabToLinearRgb({ a: 0.1, alpha: 0.31, b: 0.2, l: 0.5 }).alpha,
		).toBe(0.31);
		expect(
			linearRgbToOklab({ alpha: 0.31, b: 0.4, g: 0.3, r: 0.2 }).alpha,
		).toBe(0.31);
	});

	it('allows out-of-gamut linear RGB channels', () => {
		const result = linearRgbToOklab({ b: 0.5, g: 1.2, r: -0.1 });

		expect(result.space).toBe('oklab');
		expect(Number.isFinite(result.l)).toBe(true);
		expect(Number.isFinite(result.a)).toBe(true);
		expect(Number.isFinite(result.b)).toBe(true);
	});

	it('rejects non-finite linear RGB channels', () => {
		expect(() => linearRgbToOklab({ b: 0, g: 0, r: Number.NaN })).toThrow(
			'linear RGB r must be a finite number.',
		);
		expect(() =>
			linearRgbToOklab({ b: 0, g: Number.POSITIVE_INFINITY, r: 0 }),
		).toThrow('linear RGB g must be a finite number.');
		expect(() =>
			linearRgbToOklab({ b: Number.NEGATIVE_INFINITY, g: 0, r: 0 }),
		).toThrow('linear RGB b must be a finite number.');
	});
});

describe('precision handling', () => {
	it('normalizes near-zero conversion noise', () => {
		const result = oklchToOklab({ c: CONVERSION_EPSILON / 2, h: 90, l: 50 });

		expect(result.a).toBe(0);
		expect(result.b).toBe(0);
		expect(Object.is(result.a, -0)).toBe(false);
		expect(Object.is(result.b, -0)).toBe(false);
	});
});
