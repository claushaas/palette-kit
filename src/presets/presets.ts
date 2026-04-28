import {
  defaultLevelCurves,
  type LevelCurveConfig,
  type OverlayLevelResult,
} from "../engine/level/curves.js";
import { assertLevel, type Level } from "../engine/level/level.js";
import { defaultStateDeltas, type StateDeltaTable } from "../engine/state/state.js";

export const RESOLVER_PRESETS = Object.freeze(["soft", "neutral", "strong"] as const);

export type ResolverPresetName = (typeof RESOLVER_PRESETS)[number];

export type ResolverConfig = Readonly<{
  levelCurves: LevelCurveConfig;
  stateDeltas: StateDeltaTable;
}>;

const presetList = RESOLVER_PRESETS.join(", ");

const formatInvalidResolverPresetError = (value: unknown) =>
  `Unknown resolver preset "${String(value)}". Expected one of: ${presetList}.`;

const createNumberLevelCurve = (targets: Readonly<Record<Level, number>>) =>
  Object.freeze((level: Level): number => {
    assertLevel(level);
    return targets[level];
  });

const createOverlayLevelCurve = (targets: Readonly<Record<Level, OverlayLevelResult>>) =>
  Object.freeze((level: Level): OverlayLevelResult => {
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
  default: 0,
  hover: 2,
  active: 4,
  focus: 3,
  selected: 3,
  disabled: 6,
} satisfies StateDeltaTable);

const strongStateDeltas = Object.freeze({
  default: 0,
  hover: 4,
  active: 8,
  focus: 5,
  selected: 7,
  disabled: 14,
} satisfies StateDeltaTable);

export const softResolverConfig = Object.freeze({
  levelCurves: createLevelCurveConfig(
    softFillLevelTargets,
    softLinesLevelTargets,
    softOverlayLevelTargets,
  ),
  stateDeltas: softStateDeltas,
} satisfies ResolverConfig);

export const neutralResolverConfig = Object.freeze({
  levelCurves: defaultLevelCurves,
  stateDeltas: defaultStateDeltas,
} satisfies ResolverConfig);

export const strongResolverConfig = Object.freeze({
  levelCurves: createLevelCurveConfig(
    strongFillLevelTargets,
    strongLinesLevelTargets,
    strongOverlayLevelTargets,
  ),
  stateDeltas: strongStateDeltas,
} satisfies ResolverConfig);

export const defaultResolverConfig = neutralResolverConfig;

export const resolverPresetConfigs = Object.freeze({
  soft: softResolverConfig,
  neutral: neutralResolverConfig,
  strong: strongResolverConfig,
} satisfies Record<ResolverPresetName, ResolverConfig>);

export function isResolverPresetName(value: unknown): value is ResolverPresetName {
  return typeof value === "string" && (RESOLVER_PRESETS as readonly string[]).includes(value);
}

export function assertResolverPresetName(value: unknown): asserts value is ResolverPresetName {
  if (!isResolverPresetName(value)) {
    throw new Error(formatInvalidResolverPresetError(value));
  }
}

export function getResolverPresetConfig(preset: unknown): ResolverConfig {
  assertResolverPresetName(preset);
  return resolverPresetConfigs[preset];
}
