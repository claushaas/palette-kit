import { describe, expect, it } from "vitest";

import { createIntentRegistry, getIntent, hasIntent } from "./intent-registry.js";

describe("createIntentRegistry", () => {
  it("creates a registry with valid intents", () => {
    const registry = createIntentRegistry({
      neutral: { hue: 0, chroma: 0 },
      brand: { hue: 260, chroma: 0.14 },
    });

    expect(registry.intents.neutral).toEqual({ hue: 0, chroma: 0 });
    expect(registry.intents.brand).toEqual({ hue: 260, chroma: 0.14 });
  });

  it("normalizes intent hue", () => {
    const registry = createIntentRegistry({
      negative: { hue: -30, chroma: 0.1 },
      fullTurn: { hue: 360, chroma: 0.1 },
      overflow: { hue: 390, chroma: 0.1 },
    });

    expect(registry.intents.negative.hue).toBe(330);
    expect(registry.intents.fullTurn.hue).toBe(0);
    expect(registry.intents.overflow.hue).toBe(30);
  });

  it("preserves chroma", () => {
    const registry = createIntentRegistry({
      brand: { hue: 260, chroma: 0.142 },
    });

    expect(registry.intents.brand.chroma).toBe(0.142);
  });

  it("freezes the registry and intent definitions", () => {
    const registry = createIntentRegistry({
      brand: { hue: 260, chroma: 0.14 },
    });

    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.intents)).toBe(true);
    expect(Object.isFrozen(registry.intents.brand)).toBe(true);
  });

  it("rejects invalid intent names", () => {
    expect(() => createIntentRegistry({ "": { hue: 0, chroma: 0 } })).toThrow(
      "Intent name must not be empty.",
    );
    expect(() => createIntentRegistry({ "brand primary": { hue: 0, chroma: 0 } })).toThrow(
      'Intent name "brand primary" must not contain whitespace.',
    );
    expect(() => createIntentRegistry({ "brand.primary": { hue: 0, chroma: 0 } })).toThrow(
      'Intent name "brand.primary" must use a flat namespace.',
    );
  });

  it("rejects non-finite intent channels", () => {
    expect(() => createIntentRegistry({ brand: { hue: Number.NaN, chroma: 0 } })).toThrow(
      'Intent "brand" hue must be a finite number.',
    );
    expect(() =>
      createIntentRegistry({ brand: { hue: Number.POSITIVE_INFINITY, chroma: 0 } }),
    ).toThrow('Intent "brand" hue must be a finite number.');
    expect(() => createIntentRegistry({ brand: { hue: 0, chroma: Number.NaN } })).toThrow(
      'Intent "brand" chroma must be a finite number.',
    );
    expect(() =>
      createIntentRegistry({ brand: { hue: 0, chroma: Number.NEGATIVE_INFINITY } }),
    ).toThrow('Intent "brand" chroma must be a finite number.');
  });

  it("rejects negative chroma", () => {
    expect(() => createIntentRegistry({ brand: { hue: 260, chroma: -0.1 } })).toThrow(
      'Intent "brand" chroma must be greater than or equal to 0.',
    );
  });
});

describe("intent lookup", () => {
  const registry = createIntentRegistry({
    neutral: { hue: 0, chroma: 0 },
    brand: { hue: 260, chroma: 0.14 },
  });

  it("returns a registered intent", () => {
    expect(getIntent(registry, "brand")).toEqual({ hue: 260, chroma: 0.14 });
  });

  it("checks intent existence", () => {
    expect(hasIntent(registry, "brand")).toBe(true);
    expect(hasIntent(registry, "refund")).toBe(false);
  });

  it("throws for unknown intents", () => {
    expect(() => getIntent(registry, "refund")).toThrow(
      'Unknown intent "refund". Did you forget to register it in the Intent Registry?',
    );
  });
});
