import type { Context } from '../engine/context/context.js';
import {
	defaultLevelCurves,
	type LevelCurveConfig,
	type OverlayLevelResult,
} from '../engine/level/curves.js';
import { assertLevel, LEVELS, type Level } from '../engine/level/level.js';
import {
	defaultStateDeltas,
	type StateDeltaConfig,
	type StateDeltaTable,
} from '../engine/state/state.js';

export const RESOLVER_PRESETS = Object.freeze([
	'soft',
	'neutral',
	'strong',
] as const);

export type ResolverPresetName = (typeof RESOLVER_PRESETS)[number];

export type RelationLevelAlphaTable = Readonly<Record<Level, number>>;

export type RelationParamsConfig = Readonly<{
	on: Readonly<{
		contrastTarget: number;
		maxLuminanceShift: number;
	}>;
	over: Readonly<{
		baseAlphaByLevel: RelationLevelAlphaTable;
	}>;
	under: Readonly<{
		baseAlphaByLevel: RelationLevelAlphaTable;
		luminanceReduction: number;
	}>;
}>;

export type ChromaConfig = Readonly<{
	maxReduction: number;
	reductionStep: number;
}>;

export type ResolverConfig = Readonly<{
	levelCurves: LevelCurveConfig;
	stateDeltas: StateDeltaConfig;
	relationParams: RelationParamsConfig;
	chromaLimits: ChromaConfig;
}>;

export type ResolverConfigOverrides = Readonly<{
	levelCurves?: Partial<LevelCurveConfig>;
	stateDeltas?: Readonly<{
		luminance?: Partial<StateDeltaTable>;
		alpha?: Partial<StateDeltaTable>;
	}>;
	relationParams?: Readonly<{
		on?: Partial<RelationParamsConfig['on']>;
		over?: Readonly<{
			baseAlphaByLevel?: Partial<RelationLevelAlphaTable>;
		}>;
		under?: Readonly<{
			baseAlphaByLevel?: Partial<RelationLevelAlphaTable>;
			luminanceReduction?: number;
		}>;
	}>;
	chromaLimits?: Partial<ChromaConfig>;
}>;

const DEFAULT_CONTRAST_TARGET = 60;
const DEFAULT_MAX_LUMINANCE_SHIFT = 60;
const DEFAULT_CHROMA_MAX_REDUCTION = 1;
const DEFAULT_CHROMA_REDUCTION_STEP = 0.01;

const presetList = RESOLVER_PRESETS.join(', ');

const formatInvalidResolverPresetError = (value: unknown) =>
	`Unknown resolver preset "${String(value)}". Expected one of: ${presetList}.`;

const assertFiniteConfigNumber = (name: string, value: number) => {
	if (!Number.isFinite(value)) {
		throw new Error(`${name} must be a finite number.`);
	}
};

const assertNonNegativeConfigNumber = (name: string, value: number) => {
	assertFiniteConfigNumber(name, value);

	if (value < 0) {
		throw new Error(`${name} must be greater than or equal to 0.`);
	}
};

const resolveContextualLightness = (lightness: number, context: Context) =>
	context === 'dark' ? 100 - lightness : lightness;

const createNumberLevelCurve = (targets: Readonly<Record<Level, number>>) =>
	Object.freeze((level: Level, context: Context): number => {
		assertLevel(level);
		return resolveContextualLightness(targets[level], context);
	});

const createOverlayLevelCurve = (
	targets: Readonly<Record<Level, OverlayLevelResult>>,
) =>
	Object.freeze((level: Level, _context: Context): OverlayLevelResult => {
		assertLevel(level);
		return targets[level];
	});

const createLevelCurveConfig = (
	fillTargets: Readonly<Record<Level, number>>,
	linesTargets: Readonly<Record<Level, number>>,
	overlayTargets: Readonly<Record<Level, OverlayLevelResult>>,
): LevelCurveConfig =>
	Object.freeze({
		fill: createNumberLevelCurve(fillTargets),
		lines: createNumberLevelCurve(linesTargets),
		overlays: createOverlayLevelCurve(overlayTargets),
	});

const createAlphaTable = (
	values: Readonly<Record<Level, number>>,
): RelationLevelAlphaTable =>
	Object.freeze(
		LEVELS.reduce(
			(table, level) => {
				const value = values[level];
				assertNonNegativeConfigNumber(`relation alpha level ${level}`, value);
				table[level] = value;
				return table;
			},
			{} as Record<Level, number>,
		),
	);

const mergeAlphaTable = (
	base: RelationLevelAlphaTable,
	override: Partial<RelationLevelAlphaTable> | undefined,
): RelationLevelAlphaTable =>
	createAlphaTable(
		LEVELS.reduce(
			(table, level) => {
				table[level] = override?.[level] ?? base[level];
				return table;
			},
			{} as Record<Level, number>,
		),
	);

const mergeStateDeltaTable = (
	base: StateDeltaTable,
	override: Partial<StateDeltaTable> | undefined,
): StateDeltaTable => {
	const table = {
		active: override?.active ?? base.active,
		default: override?.default ?? base.default,
		disabled: override?.disabled ?? base.disabled,
		focus: override?.focus ?? base.focus,
		hover: override?.hover ?? base.hover,
		selected: override?.selected ?? base.selected,
	} satisfies StateDeltaTable;

	for (const [state, value] of Object.entries(table)) {
		assertNonNegativeConfigNumber(`stateDeltas.${state}`, value);
	}

	return Object.freeze(table);
};

const createRelationParamsConfig = (
	params: RelationParamsConfig,
): RelationParamsConfig => {
	assertNonNegativeConfigNumber(
		'relationParams.on.contrastTarget',
		params.on.contrastTarget,
	);
	assertNonNegativeConfigNumber(
		'relationParams.on.maxLuminanceShift',
		params.on.maxLuminanceShift,
	);
	assertNonNegativeConfigNumber(
		'relationParams.under.luminanceReduction',
		params.under.luminanceReduction,
	);

	return Object.freeze({
		on: Object.freeze({ ...params.on }),
		over: Object.freeze({
			baseAlphaByLevel: createAlphaTable(params.over.baseAlphaByLevel),
		}),
		under: Object.freeze({
			baseAlphaByLevel: createAlphaTable(params.under.baseAlphaByLevel),
			luminanceReduction: params.under.luminanceReduction,
		}),
	});
};

const createChromaConfig = (config: ChromaConfig): ChromaConfig => {
	assertNonNegativeConfigNumber(
		'chromaLimits.maxReduction',
		config.maxReduction,
	);
	assertNonNegativeConfigNumber(
		'chromaLimits.reductionStep',
		config.reductionStep,
	);

	if (config.reductionStep === 0) {
		throw new Error('chromaLimits.reductionStep must be greater than 0.');
	}

	return Object.freeze({ ...config });
};

const baseRelationParams = createRelationParamsConfig({
	on: {
		contrastTarget: DEFAULT_CONTRAST_TARGET,
		maxLuminanceShift: DEFAULT_MAX_LUMINANCE_SHIFT,
	},
	over: {
		baseAlphaByLevel: createAlphaTable({
			1: 0.04,
			2: 0.08,
			3: 0.12,
			4: 0.18,
			5: 0.24,
			6: 0.3,
			7: 0.36,
			8: 0.42,
			9: 0.5,
		}),
	},
	under: {
		baseAlphaByLevel: createAlphaTable({
			1: 0.06,
			2: 0.1,
			3: 0.16,
			4: 0.22,
			5: 0.3,
			6: 0.38,
			7: 0.46,
			8: 0.54,
			9: 0.62,
		}),
		luminanceReduction: 8,
	},
});

const baseChromaLimits = createChromaConfig({
	maxReduction: DEFAULT_CHROMA_MAX_REDUCTION,
	reductionStep: DEFAULT_CHROMA_REDUCTION_STEP,
});

const softFillLevelTargets = Object.freeze({
	1: 98,
	2: 97,
	3: 96,
	4: 94,
	5: 92,
	6: 89,
	7: 86,
	8: 82,
	9: 78,
} satisfies Record<Level, number>);

const softLinesLevelTargets = Object.freeze({
	1: 96,
	2: 95,
	3: 94,
	4: 93,
	5: 92,
	6: 91,
	7: 90,
	8: 89,
	9: 88,
} satisfies Record<Level, number>);

const softOverlayLevelTargets = Object.freeze({
	1: Object.freeze({ luminanceDelta: 0.5 }),
	2: Object.freeze({ luminanceDelta: 1 }),
	3: Object.freeze({ luminanceDelta: 1.5 }),
	4: Object.freeze({ luminanceDelta: 2 }),
	5: Object.freeze({ luminanceDelta: 2.5 }),
	6: Object.freeze({ luminanceDelta: 3 }),
	7: Object.freeze({ luminanceDelta: 3.5 }),
	8: Object.freeze({ luminanceDelta: 4 }),
	9: Object.freeze({ luminanceDelta: 4.5 }),
} satisfies Record<Level, OverlayLevelResult>);

const strongFillLevelTargets = Object.freeze({
	1: 99,
	2: 96,
	3: 92,
	4: 87,
	5: 81,
	6: 74,
	7: 66,
	8: 57,
	9: 47,
} satisfies Record<Level, number>);

const strongLinesLevelTargets = Object.freeze({
	1: 97,
	2: 95,
	3: 92,
	4: 89,
	5: 85,
	6: 81,
	7: 76,
	8: 70,
	9: 64,
} satisfies Record<Level, number>);

const strongOverlayLevelTargets = Object.freeze({
	1: Object.freeze({ luminanceDelta: 2 }),
	2: Object.freeze({ luminanceDelta: 4 }),
	3: Object.freeze({ luminanceDelta: 6 }),
	4: Object.freeze({ luminanceDelta: 8 }),
	5: Object.freeze({ luminanceDelta: 10 }),
	6: Object.freeze({ luminanceDelta: 12 }),
	7: Object.freeze({ luminanceDelta: 14 }),
	8: Object.freeze({ luminanceDelta: 16 }),
	9: Object.freeze({ luminanceDelta: 18 }),
} satisfies Record<Level, OverlayLevelResult>);

const softStateDeltas = Object.freeze({
	alpha: Object.freeze({
		active: 0,
		default: 0,
		disabled: 0,
		focus: 0,
		hover: 0,
		selected: 0,
	} satisfies StateDeltaTable),
	luminance: Object.freeze({
		active: 4,
		default: 0,
		disabled: 6,
		focus: 3,
		hover: 2,
		selected: 3,
	} satisfies StateDeltaTable),
} satisfies StateDeltaConfig);

const strongStateDeltas = Object.freeze({
	alpha: Object.freeze({
		active: 0,
		default: 0,
		disabled: 0,
		focus: 0,
		hover: 0,
		selected: 0,
	} satisfies StateDeltaTable),
	luminance: Object.freeze({
		active: 8,
		default: 0,
		disabled: 14,
		focus: 5,
		hover: 4,
		selected: 7,
	} satisfies StateDeltaTable),
} satisfies StateDeltaConfig);

const createResolverConfig = (config: ResolverConfig): ResolverConfig =>
	Object.freeze({
		chromaLimits: createChromaConfig(config.chromaLimits),
		levelCurves: Object.freeze({ ...config.levelCurves }),
		relationParams: createRelationParamsConfig(config.relationParams),
		stateDeltas: Object.freeze({
			alpha: mergeStateDeltaTable(config.stateDeltas.alpha, undefined),
			luminance: mergeStateDeltaTable(config.stateDeltas.luminance, undefined),
		}),
	});

export const softResolverConfig = createResolverConfig({
	chromaLimits: baseChromaLimits,
	levelCurves: createLevelCurveConfig(
		softFillLevelTargets,
		softLinesLevelTargets,
		softOverlayLevelTargets,
	),
	relationParams: baseRelationParams,
	stateDeltas: softStateDeltas,
});

export const neutralResolverConfig = createResolverConfig({
	chromaLimits: baseChromaLimits,
	levelCurves: defaultLevelCurves,
	relationParams: baseRelationParams,
	stateDeltas: defaultStateDeltas,
});

export const strongResolverConfig = createResolverConfig({
	chromaLimits: baseChromaLimits,
	levelCurves: createLevelCurveConfig(
		strongFillLevelTargets,
		strongLinesLevelTargets,
		strongOverlayLevelTargets,
	),
	relationParams: baseRelationParams,
	stateDeltas: strongStateDeltas,
});

export const defaultResolverConfig = neutralResolverConfig;

export const resolverPresetConfigs = Object.freeze({
	neutral: neutralResolverConfig,
	soft: softResolverConfig,
	strong: strongResolverConfig,
} satisfies Record<ResolverPresetName, ResolverConfig>);

export function isResolverPresetName(
	value: unknown,
): value is ResolverPresetName {
	return (
		typeof value === 'string' &&
		(RESOLVER_PRESETS as readonly string[]).includes(value)
	);
}

export function assertResolverPresetName(
	value: unknown,
): asserts value is ResolverPresetName {
	if (!isResolverPresetName(value)) {
		throw new Error(formatInvalidResolverPresetError(value));
	}
}

export function getResolverPresetConfig(preset: unknown): ResolverConfig {
	assertResolverPresetName(preset);
	return resolverPresetConfigs[preset];
}

export function mergeResolverConfig(
	base: ResolverConfig,
	overrides: ResolverConfigOverrides | undefined,
): ResolverConfig {
	if (overrides === undefined) {
		return base;
	}

	return createResolverConfig({
		chromaLimits: {
			maxReduction:
				overrides.chromaLimits?.maxReduction ?? base.chromaLimits.maxReduction,
			reductionStep:
				overrides.chromaLimits?.reductionStep ??
				base.chromaLimits.reductionStep,
		},
		levelCurves: {
			fill: overrides.levelCurves?.fill ?? base.levelCurves.fill,
			lines: overrides.levelCurves?.lines ?? base.levelCurves.lines,
			overlays: overrides.levelCurves?.overlays ?? base.levelCurves.overlays,
		},
		relationParams: {
			on: {
				contrastTarget:
					overrides.relationParams?.on?.contrastTarget ??
					base.relationParams.on.contrastTarget,
				maxLuminanceShift:
					overrides.relationParams?.on?.maxLuminanceShift ??
					base.relationParams.on.maxLuminanceShift,
			},
			over: {
				baseAlphaByLevel: mergeAlphaTable(
					base.relationParams.over.baseAlphaByLevel,
					overrides.relationParams?.over?.baseAlphaByLevel,
				),
			},
			under: {
				baseAlphaByLevel: mergeAlphaTable(
					base.relationParams.under.baseAlphaByLevel,
					overrides.relationParams?.under?.baseAlphaByLevel,
				),
				luminanceReduction:
					overrides.relationParams?.under?.luminanceReduction ??
					base.relationParams.under.luminanceReduction,
			},
		},
		stateDeltas: {
			alpha: mergeStateDeltaTable(
				base.stateDeltas.alpha,
				overrides.stateDeltas?.alpha,
			),
			luminance: mergeStateDeltaTable(
				base.stateDeltas.luminance,
				overrides.stateDeltas?.luminance,
			),
		},
	});
}
