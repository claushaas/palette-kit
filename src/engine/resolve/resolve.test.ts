import { describe, expect, it } from "vitest";

import { createIntentRegistry } from "../../core/intent-registry.js";
import { isOklchColor, normalizeOklch } from "../../core/oklch.js";
import * as publicApi from "../../index.js";
import { resolveColor, type ResolveColorOptions } from "./resolve.js";

const intentRegistry = createIntentRegistry({
  neutral: { hue: 0, chroma: 0 },
  brand: { hue: 260, chroma: 0.14 },
});

const surface = normalizeOklch({ l: 96, c: 0, h: 0 });

const resolve = (options: Partial<ResolveColorOptions> = {}) =>
  resolveColor({
    intentRegistry,
    usage: "fill",
    intent: "brand",
    level: 3,
    systemDefaultContext: "light",
    ...options,
  });

describe("resolveColor", () => {
  it("resolves fill colors to normalized OKLCH", () => {
    const result = resolve();

    expect(isOklchColor(result.color)).toBe(true);
    expect(result.color).toEqual({
      space: "oklch",
      l: 94,
      c: 0.14,
      h: 260,
      alpha: 1,
    });
    expect(result.axes).toEqual({
      usage: "fill",
      intent: "brand",
      context: "light",
      level: 3,
      state: "default",
    });
  });

  it("throws for unknown intents", () => {
    expect(() => resolve({ intent: "refund" })).toThrow(
      'Unknown intent "refund". Did you forget to register it in the Intent Registry?',
    );
  });

  it("throws for unknown usages", () => {
    expect(() => resolve({ usage: "chart" })).toThrow(
      'Unknown usage "chart". Expected one of: fill, visualVocabulary, lines, overlays.',
    );
  });

  it("requires level for level-driven usages", () => {
    expect(() => resolve({ usage: "fill", level: undefined })).toThrow(
      'Level is required for usage "fill".',
    );
    expect(() => resolve({ usage: "lines", level: undefined })).toThrow(
      'Level is required for usage "lines".',
    );
    expect(() => resolve({ usage: "overlays", level: undefined })).toThrow(
      'Level is required for usage "overlays".',
    );
  });

  it("rejects level for visual vocabulary", () => {
    expect(() => resolve({ usage: "visualVocabulary", level: 3, on: surface })).toThrow(
      'Level is not allowed for usage "visualVocabulary".',
    );
  });

  it("requires on relation for visual vocabulary", () => {
    expect(() => resolve({ usage: "visualVocabulary", level: undefined })).toThrow(
      'Relation "on" is required for usage "visualVocabulary".',
    );
  });

  it("rejects on relation for overlays", () => {
    expect(() => resolve({ usage: "overlays", level: 2, on: surface })).toThrow(
      'Relation "on" is not allowed for usage "overlays".',
    );
  });

  it("rejects multiple relations", () => {
    expect(() => resolve({ on: surface, over: surface })).toThrow(
      "Only one relation may be provided. Received: on, over.",
    );
  });

  it("preserves lightness for the default state", () => {
    expect(resolve({ level: 4 }).color.l).toBe(91);
    expect(resolve({ level: 4, state: "default", stateDirection: "decrease" }).color.l).toBe(91);
  });

  it("requires stateDirection for non-default states", () => {
    expect(() => resolve({ level: 4, state: "hover" })).toThrow(
      'stateDirection is required when state is not "default".',
    );
  });

  it("applies explicit state directions to lightness", () => {
    expect(resolve({ level: 4, state: "hover", stateDirection: "increase" }).color.l).toBe(94);
    expect(resolve({ level: 4, state: "hover", stateDirection: "decrease" }).color.l).toBe(88);
  });

  it("resolves context precedence", () => {
    expect(
      resolve({
        resolverContext: "dark",
        paletteContext: "light",
        systemDefaultContext: "light",
      }).axes.context,
    ).toBe("dark");
    expect(resolve({ paletteContext: "dark", systemDefaultContext: "light" }).axes.context).toBe(
      "dark",
    );
    expect(resolve({ systemDefaultContext: "light" }).axes.context).toBe("light");
  });

  it("throws when no context can be resolved", () => {
    expect(() => resolve({ systemDefaultContext: undefined })).toThrow(
      "Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.",
    );
  });

  it("is deterministic for identical inputs", () => {
    const options = {
      intentRegistry,
      usage: "fill",
      intent: "brand",
      level: 3,
      systemDefaultContext: "light",
    } satisfies ResolveColorOptions;

    expect(resolveColor(options)).toEqual(resolveColor(options));
  });

  it("does not let level changes affect hue", () => {
    expect(resolve({ level: 2 }).color.h).toBe(260);
    expect(resolve({ level: 8 }).color.h).toBe(260);
  });

  it("does not let state changes affect semantic axes", () => {
    const base = resolve({ level: 4 });
    const hover = resolve({ level: 4, state: "hover", stateDirection: "increase" });

    expect(hover.color.h).toBe(base.color.h);
    expect(hover.color.c).toBe(base.color.c);
    expect(hover.axes.usage).toBe(base.axes.usage);
    expect(hover.axes.intent).toBe(base.axes.intent);
  });

  it("freezes resolved output and axes", () => {
    const result = resolve();

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.axes)).toBe(true);
    expect(Object.isFrozen(result.color)).toBe(true);
  });

  it("does not expose resolver APIs from the public entrypoint", () => {
    expect(Object.keys(publicApi)).toEqual([]);
  });
});
