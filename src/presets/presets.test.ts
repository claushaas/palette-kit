import { describe, expect, it } from 'vitest';
import { defaultLevelCurves } from '../engine/level/curves.js';
import { LEVELS, type Level } from '../engine/level/level.js';
import { defaultStateDeltas } from '../engine/state/state.js';
import * as publicApi from '../index.js';
import {
	assertResolverPresetName,
	defaultResolverConfig,
	getResolverPresetConfig,
	isResolverPresetName,
	mergeResolverConfig,
	neutralResolverConfig,
	RESOLVER_PRESETS,
	type ResolverConfig,
	resolverPresetConfigs,
	softResolverConfig,
	strongResolverConfig,
} from './presets.js';

const invalidPresetError =
	'Unknown resolver preset "vivid". Expected one of: soft, neutral, strong.';
const invalidLevelError = 'Invalid level "0". Expected an integer from 1 to 9.';

const valuesFor = (curve: (level: Level, context: 'light') => number) =>
	LEVELS.map((level) => curve(level, 'light'));

const overlayValuesFor = (config: ResolverConfig) =>
	LEVELS.map(
		(level) => config.levelCurves.overlays(level, 'light').luminanceDelta,
	);

const variation = (values: readonly number[]) =>
	Math.max(...values) - Math.min(...values);

const maxStateDelta = (config: ResolverConfig) =>
	Math.max(...Object.values(config.stateDeltas.luminance));

describe('resolver preset validation', () => {
	it('accepts canonical resolver preset names', () => {
		for (const preset of RESOLVER_PRESETS) {
			expect(isResolverPresetName(preset)).toBe(true);
			expect(() => assertResolverPresetName(preset)).not.toThrow();
		}
	});

	it('rejects unknown preset names and non-string values', () => {
		expect(isResolverPresetName('vivid')).toBe(false);
		expect(isResolverPresetName('')).toBe(false);
		expect(isResolverPresetName(null)).toBe(false);
		expect(isResolverPresetName(1)).toBe(false);
		expect(isResolverPresetName({ preset: 'soft' })).toBe(false);
	});

	it('throws a clear error for invalid presets', () => {
		expect(() => assertResolverPresetName('vivid')).toThrow(invalidPresetError);
		expect(() => getResolverPresetConfig('vivid')).toThrow(invalidPresetError);
	});
});

describe('resolver preset configs', () => {
	it('returns the matching config for each preset', () => {
		expect(getResolverPresetConfig('soft')).toBe(softResolverConfig);
		expect(getResolverPresetConfig('neutral')).toBe(neutralResolverConfig);
		expect(getResolverPresetConfig('strong')).toBe(strongResolverConfig);
	});

	it('uses neutral as the default resolver config', () => {
		expect(defaultResolverConfig).toBe(neutralResolverConfig);
	});

	it('freezes presets, configs, nested tables, and overlay results', () => {
		expect(Object.isFrozen(RESOLVER_PRESETS)).toBe(true);
		expect(Object.isFrozen(resolverPresetConfigs)).toBe(true);

		for (const config of Object.values(resolverPresetConfigs)) {
			expect(Object.isFrozen(config)).toBe(true);
			expect(Object.isFrozen(config.levelCurves)).toBe(true);
			expect(Object.isFrozen(config.stateDeltas)).toBe(true);
			expect(Object.isFrozen(config.stateDeltas.luminance)).toBe(true);
			expect(Object.isFrozen(config.stateDeltas.alpha)).toBe(true);
			expect(Object.isFrozen(config.relationParams)).toBe(true);
			expect(Object.isFrozen(config.relationParams.over.baseAlphaByLevel)).toBe(
				true,
			);
			expect(Object.isFrozen(config.chromaLimits)).toBe(true);
			expect(Object.isFrozen(config.levelCurves.overlays(1, 'light'))).toBe(
				true,
			);
		}
	});

	it('keeps neutral aligned with the current default curves and state deltas', () => {
		expect(neutralResolverConfig.stateDeltas).toEqual(defaultStateDeltas);
		expect(valuesFor(neutralResolverConfig.levelCurves.fill)).toEqual(
			valuesFor(defaultLevelCurves.fill),
		);
		expect(valuesFor(neutralResolverConfig.levelCurves.lines)).toEqual(
			valuesFor(defaultLevelCurves.lines),
		);
		expect(overlayValuesFor(neutralResolverConfig)).toEqual(
			overlayValuesFor(defaultResolverConfig),
		);
	});

	it('defines the expected soft preset values', () => {
		expect(valuesFor(softResolverConfig.levelCurves.fill)).toEqual([
			98, 97, 96, 94, 92, 89, 86, 82, 78,
		]);
		expect(valuesFor(softResolverConfig.levelCurves.lines)).toEqual([
			96, 95, 94, 93, 92, 91, 90, 89, 88,
		]);
		expect(overlayValuesFor(softResolverConfig)).toEqual([
			0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5,
		]);
		expect(softResolverConfig.stateDeltas).toEqual({
			alpha: {
				active: 0,
				default: 0,
				disabled: 0,
				focus: 0,
				hover: 0,
				selected: 0,
			},
			luminance: {
				active: 4,
				default: 0,
				disabled: 6,
				focus: 3,
				hover: 2,
				selected: 3,
			},
		});
	});

	it('defines the expected strong preset values', () => {
		expect(valuesFor(strongResolverConfig.levelCurves.fill)).toEqual([
			99, 96, 92, 87, 81, 74, 66, 57, 47,
		]);
		expect(valuesFor(strongResolverConfig.levelCurves.lines)).toEqual([
			97, 95, 92, 89, 85, 81, 76, 70, 64,
		]);
		expect(overlayValuesFor(strongResolverConfig)).toEqual([
			2, 4, 6, 8, 10, 12, 14, 16, 18,
		]);
		expect(strongResolverConfig.stateDeltas).toEqual({
			alpha: {
				active: 0,
				default: 0,
				disabled: 0,
				focus: 0,
				hover: 0,
				selected: 0,
			},
			luminance: {
				active: 8,
				default: 0,
				disabled: 14,
				focus: 5,
				hover: 4,
				selected: 7,
			},
		});
	});

	it('defines public relation and chroma defaults', () => {
		expect(neutralResolverConfig.relationParams.on).toEqual({
			contrastTarget: 60,
			maxLuminanceShift: 60,
		});
		expect(neutralResolverConfig.relationParams.over.baseAlphaByLevel).toEqual({
			1: 0.04,
			2: 0.08,
			3: 0.12,
			4: 0.18,
			5: 0.24,
			6: 0.3,
			7: 0.36,
			8: 0.42,
			9: 0.5,
		});
		expect(neutralResolverConfig.relationParams.under.baseAlphaByLevel).toEqual(
			{
				1: 0.06,
				2: 0.1,
				3: 0.16,
				4: 0.22,
				5: 0.3,
				6: 0.38,
				7: 0.46,
				8: 0.54,
				9: 0.62,
			},
		);
		expect(neutralResolverConfig.relationParams.under.luminanceReduction).toBe(
			8,
		);
		expect(neutralResolverConfig.chromaLimits).toEqual({
			maxReduction: 1,
			reductionStep: 0.01,
		});
	});

	it('keeps soft effects smaller than neutral', () => {
		expect(
			variation(valuesFor(softResolverConfig.levelCurves.fill)),
		).toBeLessThan(
			variation(valuesFor(neutralResolverConfig.levelCurves.fill)),
		);
		expect(
			variation(valuesFor(softResolverConfig.levelCurves.lines)),
		).toBeLessThan(
			variation(valuesFor(neutralResolverConfig.levelCurves.lines)),
		);
		expect(variation(overlayValuesFor(softResolverConfig))).toBeLessThan(
			variation(overlayValuesFor(neutralResolverConfig)),
		);
		expect(maxStateDelta(softResolverConfig)).toBeLessThan(
			maxStateDelta(neutralResolverConfig),
		);
	});

	it('keeps strong effects larger than neutral', () => {
		expect(
			variation(valuesFor(strongResolverConfig.levelCurves.fill)),
		).toBeGreaterThan(
			variation(valuesFor(neutralResolverConfig.levelCurves.fill)),
		);
		expect(
			variation(valuesFor(strongResolverConfig.levelCurves.lines)),
		).toBeGreaterThan(
			variation(valuesFor(neutralResolverConfig.levelCurves.lines)),
		);
		expect(variation(overlayValuesFor(strongResolverConfig))).toBeGreaterThan(
			variation(overlayValuesFor(neutralResolverConfig)),
		);
		expect(maxStateDelta(strongResolverConfig)).toBeGreaterThan(
			maxStateDelta(neutralResolverConfig),
		);
	});

	it('rejects invalid levels without fallback', () => {
		for (const config of Object.values(resolverPresetConfigs)) {
			expect(() => config.levelCurves.fill(0 as Level, 'light')).toThrow(
				invalidLevelError,
			);
			expect(() => config.levelCurves.lines(0 as Level, 'light')).toThrow(
				invalidLevelError,
			);
			expect(() => config.levelCurves.overlays(0 as Level, 'light')).toThrow(
				invalidLevelError,
			);
		}
	});

	it('merges resolver config overrides on top of a preset', () => {
		const merged = mergeResolverConfig(softResolverConfig, {
			chromaLimits: { reductionStep: 0.02 },
			relationParams: {
				on: { contrastTarget: 75 },
				over: { baseAlphaByLevel: { 3: 0.33 } },
			},
			stateDeltas: { luminance: { hover: 9 } },
		});

		expect(merged).not.toBe(softResolverConfig);
		expect(merged.chromaLimits.reductionStep).toBe(0.02);
		expect(merged.chromaLimits.maxReduction).toBe(
			softResolverConfig.chromaLimits.maxReduction,
		);
		expect(merged.relationParams.on.contrastTarget).toBe(75);
		expect(merged.relationParams.over.baseAlphaByLevel[3]).toBe(0.33);
		expect(merged.relationParams.over.baseAlphaByLevel[2]).toBe(
			softResolverConfig.relationParams.over.baseAlphaByLevel[2],
		);
		expect(merged.stateDeltas.luminance.hover).toBe(9);
		expect(merged.stateDeltas.luminance.active).toBe(
			softResolverConfig.stateDeltas.luminance.active,
		);
		expect(Object.isFrozen(merged)).toBe(true);
	});

	it('rejects invalid resolver config overrides', () => {
		expect(() =>
			mergeResolverConfig(neutralResolverConfig, {
				stateDeltas: { luminance: { hover: -1 } },
			}),
		).toThrow('stateDeltas.hover must be greater than or equal to 0.');
		expect(() =>
			mergeResolverConfig(neutralResolverConfig, {
				chromaLimits: { reductionStep: 0 },
			}),
		).toThrow('chromaLimits.reductionStep must be greater than 0.');
	});

	it('exposes the public preset configs from the public entrypoint', () => {
		expect(Object.keys(publicApi)).toEqual([
			'createPaletteKit',
			'defaultResolverConfig',
			'neutralResolverConfig',
			'softResolverConfig',
			'strongResolverConfig',
		]);
	});
});
