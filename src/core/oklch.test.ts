import { describe, expect, it } from 'vitest';

import { assertOklchColor, isOklchColor, normalizeOklch } from './oklch.js';

describe('normalizeOklch', () => {
	it('normalizes a color with default alpha', () => {
		expect(normalizeOklch({ c: 0.14, h: 260, l: 52 })).toEqual({
			alpha: 1,
			c: 0.14,
			h: 260,
			l: 52,
			space: 'oklch',
		});
	});

	it('normalizes hue into the canonical range', () => {
		expect(normalizeOklch({ c: 0.14, h: -30, l: 52 }).h).toBe(330);
		expect(normalizeOklch({ c: 0.14, h: 390, l: 52 }).h).toBe(30);
		expect(normalizeOklch({ c: 0.14, h: 360, l: 52 }).h).toBe(0);
	});

	it('accepts valid channel boundaries', () => {
		expect(normalizeOklch({ alpha: 0, c: 0, h: 0, l: 0 })).toEqual({
			alpha: 0,
			c: 0,
			h: 0,
			l: 0,
			space: 'oklch',
		});

		expect(normalizeOklch({ alpha: 1, c: 0.2, h: 359, l: 100 })).toEqual({
			alpha: 1,
			c: 0.2,
			h: 359,
			l: 100,
			space: 'oklch',
		});
	});

	it('rejects non-finite channel values', () => {
		expect(() => normalizeOklch({ c: 0, h: 0, l: Number.NaN })).toThrow(
			'OKLCH l must be a finite number.',
		);
		expect(() =>
			normalizeOklch({ c: Number.POSITIVE_INFINITY, h: 0, l: 50 }),
		).toThrow('OKLCH c must be a finite number.');
		expect(() =>
			normalizeOklch({ c: 0, h: Number.NEGATIVE_INFINITY, l: 50 }),
		).toThrow('OKLCH h must be a finite number.');
		expect(() =>
			normalizeOklch({ alpha: Number.NaN, c: 0, h: 0, l: 50 }),
		).toThrow('OKLCH alpha must be a finite number.');
	});

	it('rejects out-of-range channel values', () => {
		expect(() => normalizeOklch({ c: 0, h: 0, l: -1 })).toThrow(
			'OKLCH l must be between 0 and 100.',
		);
		expect(() => normalizeOklch({ c: 0, h: 0, l: 101 })).toThrow(
			'OKLCH l must be between 0 and 100.',
		);
		expect(() => normalizeOklch({ c: -0.1, h: 0, l: 50 })).toThrow(
			'OKLCH c must be greater than or equal to 0.',
		);
		expect(() => normalizeOklch({ alpha: -0.1, c: 0, h: 0, l: 50 })).toThrow(
			'OKLCH alpha must be between 0 and 1.',
		);
		expect(() => normalizeOklch({ alpha: 1.1, c: 0, h: 0, l: 50 })).toThrow(
			'OKLCH alpha must be between 0 and 1.',
		);
	});
});

describe('OKLCH validation helpers', () => {
	const color = {
		alpha: 1,
		c: 0.14,
		h: 260,
		l: 52,
		space: 'oklch',
	};

	it('identifies normalized OKLCH colors', () => {
		expect(isOklchColor(color)).toBe(true);
		expect(isOklchColor({ ...color, h: 360 })).toBe(false);
		expect(isOklchColor({ ...color, alpha: undefined })).toBe(false);
		expect(isOklchColor({ ...color, space: 'srgb' })).toBe(false);
	});

	it('asserts normalized OKLCH colors', () => {
		expect(() => assertOklchColor(color)).not.toThrow();
		expect(() => assertOklchColor({ ...color, c: -1 })).toThrow(
			'Expected a normalized OKLCH color.',
		);
	});
});
