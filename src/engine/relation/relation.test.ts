import { describe, expect, it } from "vitest";

import * as publicApi from "../../index.js";
import { normalizeOklch, type OklchColor } from "../../core/oklch.js";
import {
  applyRelation,
  assertRelation,
  isRelation,
  relationApplicationHooks,
  relationCompatibility,
  RELATIONS,
  type RelationOptions,
  validateRelationOptions,
} from "./relation.js";

const baseColor = normalizeOklch({ l: 50, c: 0.1, h: 250 });
const targetColor = normalizeOklch({ l: 96, c: 0, h: 0 });

const invalidRelationError = 'Invalid relation "beside". Expected one of: on, over, under.';

describe("relation validation", () => {
  it("accepts canonical relations", () => {
    for (const relation of RELATIONS) {
      expect(isRelation(relation)).toBe(true);
      expect(() => assertRelation(relation)).not.toThrow();
    }
  });

  it("rejects unknown relations and non-string values", () => {
    expect(isRelation("beside")).toBe(false);
    expect(isRelation("")).toBe(false);
    expect(isRelation(null)).toBe(false);
    expect(isRelation({ relation: "on" })).toBe(false);
  });

  it("throws a clear error for invalid relations", () => {
    expect(() => assertRelation("beside")).toThrow(invalidRelationError);
  });

  it("freezes relation constants and compatibility matrix entries", () => {
    expect(Object.isFrozen(RELATIONS)).toBe(true);
    expect(Object.isFrozen(relationCompatibility)).toBe(true);
    expect(Object.isFrozen(relationCompatibility.fill)).toBe(true);
    expect(Object.isFrozen(relationCompatibility.visualVocabulary)).toBe(true);
    expect(Object.isFrozen(relationCompatibility.lines)).toBe(true);
    expect(Object.isFrozen(relationCompatibility.overlays)).toBe(true);
  });
});

describe("relation compatibility", () => {
  it("defines the usage by relation matrix", () => {
    expect(relationCompatibility).toEqual({
      fill: { on: "optional", over: "forbidden", under: "forbidden" },
      visualVocabulary: { on: "required", over: "forbidden", under: "forbidden" },
      lines: { on: "optional", over: "forbidden", under: "forbidden" },
      overlays: { on: "forbidden", over: "optional", under: "optional" },
    });
  });

  it("allows optional relation omissions", () => {
    expect(validateRelationOptions("fill")).toBeUndefined();
    expect(validateRelationOptions("lines")).toBeUndefined();
    expect(validateRelationOptions("overlays")).toBeUndefined();
  });

  it("requires on for visual vocabulary", () => {
    expect(() => validateRelationOptions("visualVocabulary")).toThrow(
      'Relation "on" is required for usage "visualVocabulary".',
    );
  });

  it("accepts allowed relations", () => {
    expect(validateRelationOptions("fill", { on: targetColor })).toEqual({
      relation: "on",
      target: targetColor,
    });
    expect(validateRelationOptions("lines", { on: targetColor })).toEqual({
      relation: "on",
      target: targetColor,
    });
    expect(validateRelationOptions("visualVocabulary", { on: targetColor })).toEqual({
      relation: "on",
      target: targetColor,
    });
    expect(validateRelationOptions("overlays", { over: targetColor })).toEqual({
      relation: "over",
      target: targetColor,
    });
    expect(validateRelationOptions("overlays", { under: targetColor })).toEqual({
      relation: "under",
      target: targetColor,
    });
  });

  it("rejects forbidden usage and relation combinations", () => {
    expect(() => validateRelationOptions("fill", { over: targetColor })).toThrow(
      'Relation "over" is not allowed for usage "fill".',
    );
    expect(() => validateRelationOptions("lines", { under: targetColor })).toThrow(
      'Relation "under" is not allowed for usage "lines".',
    );
    expect(() => validateRelationOptions("visualVocabulary", { over: targetColor })).toThrow(
      'Relation "over" is not allowed for usage "visualVocabulary".',
    );
    expect(() => validateRelationOptions("overlays", { on: targetColor })).toThrow(
      'Relation "on" is not allowed for usage "overlays".',
    );
  });

  it("rejects multiple relations", () => {
    expect(() => validateRelationOptions("fill", { on: targetColor, over: targetColor })).toThrow(
      "Only one relation may be provided. Received: on, over.",
    );
  });

  it("rejects invalid relation targets", () => {
    expect(() =>
      validateRelationOptions("fill", { on: { space: "rgb" } } as unknown as RelationOptions),
    ).toThrow('Relation "on" target must be a normalized OKLCH color.');
  });
});

describe("relation application hooks", () => {
  it("freezes the application hook registry", () => {
    expect(Object.isFrozen(relationApplicationHooks)).toBe(true);
  });

  it("preserves color when no relation is provided", () => {
    const result = applyRelation({ usage: "fill", color: baseColor });

    expect(result).toEqual({ color: baseColor });
    expect(result.color).toBe(baseColor);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("applies relation hooks without changing color channels", () => {
    const result = applyRelation({
      usage: "fill",
      color: baseColor,
      relations: { on: targetColor },
    });

    expect(result.color).toBe(baseColor);
    expect(result.color).toEqual({
      space: "oklch",
      l: 50,
      c: 0.1,
      h: 250,
      alpha: 1,
    });
    expect(result.relation).toEqual({ relation: "on", target: targetColor });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("rejects invalid input colors", () => {
    expect(() =>
      applyRelation({
        usage: "fill",
        color: { space: "oklch", l: 101, c: 0, h: 0, alpha: 1 } as OklchColor,
      }),
    ).toThrow("Relation input color must be a normalized OKLCH color.");
  });

  it("does not expose relation APIs from the public entrypoint", () => {
    expect(Object.keys(publicApi)).toEqual([]);
  });
});
