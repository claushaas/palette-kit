import { describe, expect, it } from 'vitest';
import { normalizeOklch, type OklchColor } from '../../core/oklch.js';
import * as publicApi from '../../index.js';
import { PaletteKitError } from '../../utils/errors/errors.js';
import {
	applyRelation,
	assertRelation,
	isRelation,
	RELATIONS,
	type RelationOptions,
	relationApplicationHooks,
	relationCompatibility,
	validateRelationOptions,
} from './relation.js';

const baseColor = normalizeOklch({ c: 0.1, h: 250, l: 50 });
const targetColor = normalizeOklch({ c: 0, h: 0, l: 96 });

const invalidRelationError =
	'Invalid relation "beside". Expected one of: on, over, under.';

describe('relation validation', () => {
	it('accepts canonical relations', () => {
		for (const relation of RELATIONS) {
			expect(isRelation(relation)).toBe(true);
			expect(() => assertRelation(relation)).not.toThrow();
		}
	});

	it('rejects unknown relations and non-string values', () => {
		expect(isRelation('beside')).toBe(false);
		expect(isRelation('')).toBe(false);
		expect(isRelation(null)).toBe(false);
		expect(isRelation({ relation: 'on' })).toBe(false);
	});

	it('throws a clear error for invalid relations', () => {
		expect(() => assertRelation('beside')).toThrow(invalidRelationError);
	});

	it('freezes relation constants and compatibility matrix entries', () => {
		expect(Object.isFrozen(RELATIONS)).toBe(true);
		expect(Object.isFrozen(relationCompatibility)).toBe(true);
		expect(Object.isFrozen(relationCompatibility.fill)).toBe(true);
		expect(Object.isFrozen(relationCompatibility.visualVocabulary)).toBe(true);
		expect(Object.isFrozen(relationCompatibility.lines)).toBe(true);
		expect(Object.isFrozen(relationCompatibility.overlays)).toBe(true);
	});
});

describe('relation compatibility', () => {
	it('defines the usage by relation matrix', () => {
		expect(relationCompatibility).toEqual({
			fill: { on: 'optional', over: 'forbidden', under: 'forbidden' },
			lines: { on: 'optional', over: 'forbidden', under: 'forbidden' },
			overlays: { on: 'forbidden', over: 'optional', under: 'optional' },
			visualVocabulary: {
				on: 'required',
				over: 'forbidden',
				under: 'forbidden',
			},
		});
	});

	it('allows optional relation omissions', () => {
		expect(validateRelationOptions('fill')).toBeUndefined();
		expect(validateRelationOptions('lines')).toBeUndefined();
		expect(validateRelationOptions('overlays')).toBeUndefined();
	});

	it('requires on for visual vocabulary', () => {
		expect(() => validateRelationOptions('visualVocabulary')).toThrow(
			'Relation "on" is required for usage "visualVocabulary".',
		);
		expect(() => validateRelationOptions('visualVocabulary')).toThrow(
			PaletteKitError,
		);
	});

	it('accepts allowed relations', () => {
		expect(validateRelationOptions('fill', { on: targetColor })).toEqual({
			relation: 'on',
			target: targetColor,
		});
		expect(validateRelationOptions('lines', { on: targetColor })).toEqual({
			relation: 'on',
			target: targetColor,
		});
		expect(
			validateRelationOptions('visualVocabulary', { on: targetColor }),
		).toEqual({
			relation: 'on',
			target: targetColor,
		});
		expect(validateRelationOptions('overlays', { over: targetColor })).toEqual({
			relation: 'over',
			target: targetColor,
		});
		expect(validateRelationOptions('overlays', { under: targetColor })).toEqual(
			{
				relation: 'under',
				target: targetColor,
			},
		);
	});

	it('rejects forbidden usage and relation combinations', () => {
		expect(() =>
			validateRelationOptions('fill', { over: targetColor }),
		).toThrow('Relation "over" is not allowed for usage "fill".');
		expect(() =>
			validateRelationOptions('fill', { over: targetColor }),
		).toThrow(PaletteKitError);
		expect(() =>
			validateRelationOptions('lines', { under: targetColor }),
		).toThrow('Relation "under" is not allowed for usage "lines".');
		expect(() =>
			validateRelationOptions('visualVocabulary', { over: targetColor }),
		).toThrow('Relation "over" is not allowed for usage "visualVocabulary".');
		expect(() =>
			validateRelationOptions('overlays', { on: targetColor }),
		).toThrow('Relation "on" is not allowed for usage "overlays".');
	});

	it('rejects multiple relations', () => {
		expect(() =>
			validateRelationOptions('fill', { on: targetColor, over: targetColor }),
		).toThrow('Only one relation may be provided. Received: on, over.');
		expect(() =>
			validateRelationOptions('fill', { on: targetColor, over: targetColor }),
		).toThrow(PaletteKitError);
	});

	it('rejects invalid relation targets', () => {
		expect(() =>
			validateRelationOptions('fill', {
				on: { space: 'rgb' },
			} as unknown as RelationOptions),
		).toThrow('Relation "on" target must be a normalized OKLCH color.');
		expect(() =>
			validateRelationOptions('fill', {
				on: { space: 'rgb' },
			} as unknown as RelationOptions),
		).toThrow(PaletteKitError);
	});
});

describe('relation application hooks', () => {
	it('freezes the application hook registry', () => {
		expect(Object.isFrozen(relationApplicationHooks)).toBe(true);
	});

	it('preserves color when no relation is provided', () => {
		const result = applyRelation({ color: baseColor, usage: 'fill' });

		expect(result).toEqual({ color: baseColor });
		expect(result.color).toBe(baseColor);
		expect(Object.isFrozen(result)).toBe(true);
	});

	it('applies relation hooks without changing color channels', () => {
		const result = applyRelation({
			color: baseColor,
			relations: { on: targetColor },
			usage: 'fill',
		});

		expect(result.color).toBe(baseColor);
		expect(result.color).toEqual({
			alpha: 1,
			c: 0.1,
			h: 250,
			l: 50,
			space: 'oklch',
		});
		expect(result.relation).toEqual({ relation: 'on', target: targetColor });
		expect(Object.isFrozen(result)).toBe(true);
	});

	it('rejects invalid input colors', () => {
		expect(() =>
			applyRelation({
				color: { alpha: 1, c: 0, h: 0, l: 101, space: 'oklch' } as OklchColor,
				usage: 'fill',
			}),
		).toThrow('Relation input color must be a normalized OKLCH color.');
		expect(() =>
			applyRelation({
				color: { alpha: 1, c: 0, h: 0, l: 101, space: 'oklch' } as OklchColor,
				usage: 'fill',
			}),
		).toThrow(PaletteKitError);
	});

	it('does not expose relation APIs from the public entrypoint', () => {
		expect(Object.keys(publicApi)).toEqual(['createPaletteKit']);
	});
});
