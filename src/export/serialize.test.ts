import { describe, expect, it } from 'vitest';

import * as publicApi from '../index.js';
import { PaletteKitError } from '../utils/errors/errors.js';
import {
	type SerializationOptions,
	serializeColor,
	serializeOklchToHex,
	serializeOklchToOklab,
	serializeOklchToP3,
	serializeOklchToRgba,
	serializeOklchToSrgb,
} from './serialize.js';

describe('OKLCH serialization', () => {
	it('serializes neutral OKLCH to RGBA', () => {
		expect(serializeOklchToRgba({ alpha: 0.42, c: 0, h: 0, l: 100 })).toEqual({
			a: 0.42,
			b: 255,
			g: 255,
			r: 255,
		});

		expect(serializeOklchToRgba({ c: 0, h: 0, l: 0 })).toEqual({
			a: 1,
			b: 0,
			g: 0,
			r: 0,
		});
	});

	it('serializes OKLCH to OKLab', () => {
		expect(serializeOklchToOklab({ alpha: 0.42, c: 0, h: 260, l: 50 })).toEqual(
			{
				a: 0,
				alpha: 0.42,
				b: 0,
				l: 0.5,
				space: 'oklab',
			},
		);
	});

	it('serializes neutral OKLCH to sRGB', () => {
		expect(serializeOklchToSrgb({ alpha: 0.42, c: 0, h: 0, l: 100 })).toEqual({
			alpha: 0.42,
			b: 255,
			g: 255,
			r: 255,
		});

		expect(serializeOklchToSrgb({ c: 0, h: 0, l: 0 })).toEqual({
			alpha: 1,
			b: 0,
			g: 0,
			r: 0,
		});
	});

	it('serializes neutral OKLCH to Display-P3', () => {
		expect(serializeOklchToP3({ alpha: 0.42, c: 0, h: 0, l: 100 })).toEqual({
			alpha: 0.42,
			b: 255,
			g: 255,
			r: 255,
		});

		expect(serializeOklchToP3({ c: 0, h: 0, l: 0 })).toEqual({
			alpha: 1,
			b: 0,
			g: 0,
			r: 0,
		});
	});

	it('serializes OKLCH to lowercase HEX without alpha', () => {
		expect(serializeOklchToHex({ alpha: 0.5, c: 0, h: 0, l: 100 })).toBe(
			'#ffffff',
		);
		expect(serializeOklchToHex({ c: 0, h: 0, l: 0 })).toBe('#000000');
	});

	it('uses explicit clip gamut handling for out-of-range sRGB channels', () => {
		const rgba = serializeOklchToRgba(
			{ c: 0.4, h: 40, l: 70 },
			{ gamutStrategy: 'clip' },
		);

		expect(rgba.r).toBeGreaterThanOrEqual(0);
		expect(rgba.r).toBeLessThanOrEqual(255);
		expect(rgba.g).toBeGreaterThanOrEqual(0);
		expect(rgba.g).toBeLessThanOrEqual(255);
		expect(rgba.b).toBeGreaterThanOrEqual(0);
		expect(rgba.b).toBeLessThanOrEqual(255);
	});

	it('uses explicit clip gamut handling for out-of-range Display-P3 channels', () => {
		const p3 = serializeOklchToP3(
			{ c: 0.4, h: 40, l: 70 },
			{ gamutStrategy: 'clip' },
		);

		expect(p3.r).toBeGreaterThanOrEqual(0);
		expect(p3.r).toBeLessThanOrEqual(255);
		expect(p3.g).toBeGreaterThanOrEqual(0);
		expect(p3.g).toBeLessThanOrEqual(255);
		expect(p3.b).toBeGreaterThanOrEqual(0);
		expect(p3.b).toBeLessThanOrEqual(255);
	});

	it('rejects unsupported gamut strategies', () => {
		expect(() =>
			serializeOklchToRgba({ c: 0, h: 0, l: 50 }, {
				gamutStrategy: 'compress',
			} as unknown as SerializationOptions),
		).toThrow('Unsupported gamut strategy "compress". Expected "clip".');
	});

	it('rejects invalid OKLCH inputs through canonical validation', () => {
		expect(() => serializeOklchToRgba({ c: 0, h: 0, l: 101 })).toThrow(
			'OKLCH l must be between 0 and 100.',
		);
		expect(() => serializeOklchToHex({ c: -0.1, h: 0, l: 50 })).toThrow(
			'OKLCH c must be greater than or equal to 0.',
		);
	});

	it('dispatches supported output formats', () => {
		expect(serializeColor({ c: 0, h: 0, l: 50 }, 'oklch')).toEqual({
			alpha: 1,
			c: 0,
			h: 0,
			l: 50,
			space: 'oklch',
		});
		expect(serializeColor({ c: 0, h: 0, l: 50 }, 'oklab')).toEqual({
			a: 0,
			alpha: 1,
			b: 0,
			l: 0.5,
			space: 'oklab',
		});
		expect(serializeColor({ c: 0, h: 0, l: 100 }, 'srgb')).toEqual({
			alpha: 1,
			b: 255,
			g: 255,
			r: 255,
		});
		expect(serializeColor({ c: 0, h: 0, l: 100 }, 'p3')).toEqual({
			alpha: 1,
			b: 255,
			g: 255,
			r: 255,
		});
		expect(serializeColor({ c: 0, h: 0, l: 100 }, 'hex')).toBe('#ffffff');
		expect(serializeColor({ c: 0, h: 0, l: 0 }, 'rgba')).toEqual({
			a: 1,
			b: 0,
			g: 0,
			r: 0,
		});
	});

	it('rejects unknown output formats with explicit errors', () => {
		expect(() => serializeColor({ c: 0, h: 0, l: 50 }, 'css' as never)).toThrow(
			'Unsupported color output "css" in Phase 10 serializer.',
		);
		expect(() => serializeColor({ c: 0, h: 0, l: 50 }, 'css' as never)).toThrow(
			PaletteKitError,
		);
	});

	it('keeps serializer APIs internal to the package entrypoint', () => {
		expect(Object.keys(publicApi)).toEqual(['createPaletteKit']);
	});
});
