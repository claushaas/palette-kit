import { describe, expect, it } from "vitest";

import * as publicApi from "../../index.js";
import {
  applyStateDelta,
  assertState,
  defaultStateDeltas,
  isState,
  STATES,
  type State,
} from "./state.js";

const invalidStateError =
  'Invalid state "pressed". Expected one of: default, hover, active, focus, selected, disabled.';

describe("state validation", () => {
  it("accepts canonical states", () => {
    for (const state of STATES) {
      expect(isState(state)).toBe(true);
      expect(() => assertState(state)).not.toThrow();
    }
  });

  it("rejects unknown states and non-string values", () => {
    expect(isState("pressed")).toBe(false);
    expect(isState("")).toBe(false);
    expect(isState(null)).toBe(false);
    expect(isState(1)).toBe(false);
    expect(isState({ state: "hover" })).toBe(false);
  });

  it("throws a clear error for invalid states", () => {
    expect(() => assertState("pressed")).toThrow(invalidStateError);
  });

  it("freezes canonical states and default deltas", () => {
    expect(Object.isFrozen(STATES)).toBe(true);
    expect(Object.isFrozen(defaultStateDeltas)).toBe(true);
  });
});

describe("state deltas", () => {
  it("defines the default luminance delta magnitudes", () => {
    expect(defaultStateDeltas).toEqual({
      default: 0,
      hover: 3,
      active: 6,
      focus: 4,
      selected: 5,
      disabled: 10,
    });
  });

  it("preserves default state values", () => {
    expect(applyStateDelta(42, "default", "increase")).toBe(42);
    expect(applyStateDelta(42, "default", "decrease")).toBe(42);
  });

  it("applies explicit increase and decrease directions", () => {
    expect(applyStateDelta(50, "hover", "increase")).toBe(53);
    expect(applyStateDelta(50, "hover", "decrease")).toBe(47);
    expect(applyStateDelta(50, "active", "increase")).toBe(56);
    expect(applyStateDelta(50, "active", "decrease")).toBe(44);
  });

  it("uses disabled as a magnitude without inferring direction", () => {
    expect(applyStateDelta(50, "disabled", "increase")).toBe(60);
    expect(applyStateDelta(50, "disabled", "decrease")).toBe(40);
  });

  it("clamps applied values to the 0..100 range", () => {
    expect(applyStateDelta(98, "active", "increase")).toBe(100);
    expect(applyStateDelta(2, "active", "decrease")).toBe(0);
    expect(applyStateDelta(120, "default", "increase")).toBe(100);
    expect(applyStateDelta(-20, "default", "decrease")).toBe(0);
  });

  it("rejects invalid states without fallback", () => {
    expect(() => applyStateDelta(50, "pressed" as State, "increase")).toThrow(invalidStateError);
  });

  it("rejects non-finite input values", () => {
    expect(() => applyStateDelta(Number.NaN, "hover", "increase")).toThrow(
      "State delta value must be a finite number.",
    );
    expect(() => applyStateDelta(Number.POSITIVE_INFINITY, "hover", "increase")).toThrow(
      "State delta value must be a finite number.",
    );
  });

  it("does not expose state APIs from the public entrypoint", () => {
    expect(Object.keys(publicApi)).toEqual(["createPaletteKit"]);
  });
});
