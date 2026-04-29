import { describe, expect, it } from 'vitest';

import * as publicApi from '../../index.js';
import {
	applyStateAlphaDelta,
	applyStateDelta,
	assertState,
	defaultStateDeltas,
	isState,
	STATES,
	type State,
} from './state.js';

const invalidStateError =
	'Invalid state "pressed". Expected one of: default, hover, active, focus, selected, disabled.';

describe('state validation', () => {
	it('accepts canonical states', () => {
		for (const state of STATES) {
			expect(isState(state)).toBe(true);
			expect(() => assertState(state)).not.toThrow();
		}
	});

	it('rejects unknown states and non-string values', () => {
		expect(isState('pressed')).toBe(false);
		expect(isState('')).toBe(false);
		expect(isState(null)).toBe(false);
		expect(isState(1)).toBe(false);
		expect(isState({ state: 'hover' })).toBe(false);
	});

	it('throws a clear error for invalid states', () => {
		expect(() => assertState('pressed')).toThrow(invalidStateError);
	});

	it('freezes canonical states and default deltas', () => {
		expect(Object.isFrozen(STATES)).toBe(true);
		expect(Object.isFrozen(defaultStateDeltas)).toBe(true);
		expect(Object.isFrozen(defaultStateDeltas.luminance)).toBe(true);
		expect(Object.isFrozen(defaultStateDeltas.alpha)).toBe(true);
	});
});

describe('state deltas', () => {
	it('defines the default luminance delta magnitudes', () => {
		expect(defaultStateDeltas.luminance).toEqual({
			active: 6,
			default: 0,
			disabled: 10,
			focus: 4,
			hover: 3,
			selected: 5,
		});
		expect(defaultStateDeltas.alpha).toEqual({
			active: 0,
			default: 0,
			disabled: 0,
			focus: 0,
			hover: 0,
			selected: 0,
		});
	});

	it('preserves default state values', () => {
		expect(applyStateDelta(42, 'default', 'increase')).toBe(42);
		expect(applyStateDelta(42, 'default', 'decrease')).toBe(42);
	});

	it('applies explicit increase and decrease directions', () => {
		expect(applyStateDelta(50, 'hover', 'increase')).toBe(53);
		expect(applyStateDelta(50, 'hover', 'decrease')).toBe(47);
		expect(applyStateDelta(50, 'active', 'increase')).toBe(56);
		expect(applyStateDelta(50, 'active', 'decrease')).toBe(44);
	});

	it('uses disabled as a magnitude without inferring direction', () => {
		expect(applyStateDelta(50, 'disabled', 'increase')).toBe(60);
		expect(applyStateDelta(50, 'disabled', 'decrease')).toBe(40);
	});

	it('clamps applied values to the 0..100 range', () => {
		expect(applyStateDelta(98, 'active', 'increase')).toBe(100);
		expect(applyStateDelta(2, 'active', 'decrease')).toBe(0);
		expect(applyStateDelta(120, 'default', 'increase')).toBe(100);
		expect(applyStateDelta(-20, 'default', 'decrease')).toBe(0);
	});

	it('rejects invalid states without fallback', () => {
		expect(() => applyStateDelta(50, 'pressed' as State, 'increase')).toThrow(
			invalidStateError,
		);
	});

	it('rejects non-finite input values', () => {
		expect(() => applyStateDelta(Number.NaN, 'hover', 'increase')).toThrow(
			'State delta value must be a finite number.',
		);
		expect(() =>
			applyStateDelta(Number.POSITIVE_INFINITY, 'hover', 'increase'),
		).toThrow('State delta value must be a finite number.');
	});

	it('applies explicit alpha deltas with 0..1 clamping', () => {
		const deltas = {
			active: 0.2,
			default: 0,
			disabled: 0.5,
			focus: 0.1,
			hover: 0.1,
			selected: 0.15,
		};

		expect(applyStateAlphaDelta(0.4, 'default', 'increase', deltas)).toBe(0.4);
		expect(applyStateAlphaDelta(0.4, 'hover', 'increase', deltas)).toBe(0.5);
		expect(applyStateAlphaDelta(0.4, 'hover', 'decrease', deltas)).toBe(0.3);
		expect(applyStateAlphaDelta(0.9, 'disabled', 'increase', deltas)).toBe(1);
		expect(applyStateAlphaDelta(0.1, 'disabled', 'decrease', deltas)).toBe(0);
	});

	it('rejects non-finite alpha values', () => {
		expect(() => applyStateAlphaDelta(Number.NaN, 'hover', 'increase')).toThrow(
			'State alpha delta value must be a finite number.',
		);
	});

	it('does not expose state APIs from the public entrypoint', () => {
		expect(Object.keys(publicApi)).toEqual([
			'createPaletteKit',
			'defaultResolverConfig',
			'neutralResolverConfig',
			'softResolverConfig',
			'strongResolverConfig',
		]);
	});
});
