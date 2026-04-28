import { describe, expect, it } from "vitest";

import * as publicApi from "../index.js";
import { defaultLevelCurves } from "../engine/level/curves.js";
import { LEVELS, type Level } from "../engine/level/level.js";
import { defaultStateDeltas, type State } from "../engine/state/state.js";
import {
  assertResolverPresetName,
  defaultResolverConfig,
  getResolverPresetConfig,
  isResolverPresetName,
  neutralResolverConfig,
  RESOLVER_PRESETS,
  resolverPresetConfigs,
  softResolverConfig,
  strongResolverConfig,
  type ResolverConfig,
} from "./presets.js";

const invalidPresetError =
  'Unknown resolver preset "vivid". Expected one of: soft, neutral, strong.';
const invalidLevelError = 'Invalid level "0". Expected an integer from 1 to 9.';

const valuesFor = (curve: (level: Level) => number) => LEVELS.map((level) => curve(level));

const overlayValuesFor = (config: ResolverConfig) =>
  LEVELS.map((level) => config.levelCurves.overlays(level).luminanceDelta);

const variation = (values: readonly number[]) => Math.max(...values) - Math.min(...values);

const maxStateDelta = (config: ResolverConfig) =>
  Math.max(...Object.values(config.stateDeltas as Readonly<Record<State, number>>));

describe("resolver preset validation", () => {
  it("accepts canonical resolver preset names", () => {
    for (const preset of RESOLVER_PRESETS) {
      expect(isResolverPresetName(preset)).toBe(true);
      expect(() => assertResolverPresetName(preset)).not.toThrow();
    }
  });

  it("rejects unknown preset names and non-string values", () => {
    expect(isResolverPresetName("vivid")).toBe(false);
    expect(isResolverPresetName("")).toBe(false);
    expect(isResolverPresetName(null)).toBe(false);
    expect(isResolverPresetName(1)).toBe(false);
    expect(isResolverPresetName({ preset: "soft" })).toBe(false);
  });

  it("throws a clear error for invalid presets", () => {
    expect(() => assertResolverPresetName("vivid")).toThrow(invalidPresetError);
    expect(() => getResolverPresetConfig("vivid")).toThrow(invalidPresetError);
  });
});

describe("resolver preset configs", () => {
  it("returns the matching config for each preset", () => {
    expect(getResolverPresetConfig("soft")).toBe(softResolverConfig);
    expect(getResolverPresetConfig("neutral")).toBe(neutralResolverConfig);
    expect(getResolverPresetConfig("strong")).toBe(strongResolverConfig);
  });

  it("uses neutral as the default resolver config", () => {
    expect(defaultResolverConfig).toBe(neutralResolverConfig);
  });

  it("freezes presets, configs, nested tables, and overlay results", () => {
    expect(Object.isFrozen(RESOLVER_PRESETS)).toBe(true);
    expect(Object.isFrozen(resolverPresetConfigs)).toBe(true);

    for (const config of Object.values(resolverPresetConfigs)) {
      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.levelCurves)).toBe(true);
      expect(Object.isFrozen(config.stateDeltas)).toBe(true);
      expect(Object.isFrozen(config.levelCurves.overlays(1))).toBe(true);
    }
  });

  it("keeps neutral aligned with the current default curves and state deltas", () => {
    expect(neutralResolverConfig.levelCurves).toBe(defaultLevelCurves);
    expect(neutralResolverConfig.stateDeltas).toBe(defaultStateDeltas);
    expect(valuesFor(neutralResolverConfig.levelCurves.fill)).toEqual(
      valuesFor(defaultLevelCurves.fill),
    );
    expect(valuesFor(neutralResolverConfig.levelCurves.lines)).toEqual(
      valuesFor(defaultLevelCurves.lines),
    );
    expect(overlayValuesFor(neutralResolverConfig)).toEqual(overlayValuesFor(defaultResolverConfig));
  });

  it("defines the expected soft preset values", () => {
    expect(valuesFor(softResolverConfig.levelCurves.fill)).toEqual([
      98, 97, 96, 94, 92, 89, 86, 82, 78,
    ]);
    expect(valuesFor(softResolverConfig.levelCurves.lines)).toEqual([
      96, 95, 94, 93, 92, 91, 90, 89, 88,
    ]);
    expect(overlayValuesFor(softResolverConfig)).toEqual([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]);
    expect(softResolverConfig.stateDeltas).toEqual({
      default: 0,
      hover: 2,
      active: 4,
      focus: 3,
      selected: 3,
      disabled: 6,
    });
  });

  it("defines the expected strong preset values", () => {
    expect(valuesFor(strongResolverConfig.levelCurves.fill)).toEqual([
      99, 96, 92, 87, 81, 74, 66, 57, 47,
    ]);
    expect(valuesFor(strongResolverConfig.levelCurves.lines)).toEqual([
      97, 95, 92, 89, 85, 81, 76, 70, 64,
    ]);
    expect(overlayValuesFor(strongResolverConfig)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18]);
    expect(strongResolverConfig.stateDeltas).toEqual({
      default: 0,
      hover: 4,
      active: 8,
      focus: 5,
      selected: 7,
      disabled: 14,
    });
  });

  it("keeps soft effects smaller than neutral", () => {
    expect(variation(valuesFor(softResolverConfig.levelCurves.fill))).toBeLessThan(
      variation(valuesFor(neutralResolverConfig.levelCurves.fill)),
    );
    expect(variation(valuesFor(softResolverConfig.levelCurves.lines))).toBeLessThan(
      variation(valuesFor(neutralResolverConfig.levelCurves.lines)),
    );
    expect(variation(overlayValuesFor(softResolverConfig))).toBeLessThan(
      variation(overlayValuesFor(neutralResolverConfig)),
    );
    expect(maxStateDelta(softResolverConfig)).toBeLessThan(maxStateDelta(neutralResolverConfig));
  });

  it("keeps strong effects larger than neutral", () => {
    expect(variation(valuesFor(strongResolverConfig.levelCurves.fill))).toBeGreaterThan(
      variation(valuesFor(neutralResolverConfig.levelCurves.fill)),
    );
    expect(variation(valuesFor(strongResolverConfig.levelCurves.lines))).toBeGreaterThan(
      variation(valuesFor(neutralResolverConfig.levelCurves.lines)),
    );
    expect(variation(overlayValuesFor(strongResolverConfig))).toBeGreaterThan(
      variation(overlayValuesFor(neutralResolverConfig)),
    );
    expect(maxStateDelta(strongResolverConfig)).toBeGreaterThan(maxStateDelta(neutralResolverConfig));
  });

  it("rejects invalid levels without fallback", () => {
    for (const config of Object.values(resolverPresetConfigs)) {
      expect(() => config.levelCurves.fill(0 as Level)).toThrow(invalidLevelError);
      expect(() => config.levelCurves.lines(0 as Level)).toThrow(invalidLevelError);
      expect(() => config.levelCurves.overlays(0 as Level)).toThrow(invalidLevelError);
    }
  });

  it("does not expose preset APIs from the public entrypoint", () => {
    expect(Object.keys(publicApi)).toEqual([]);
  });
});
