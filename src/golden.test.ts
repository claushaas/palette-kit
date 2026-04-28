import { describe, expect, it } from "vitest";

import { createIntentRegistry } from "./core/intent-registry.js";
import type { OklchColor } from "./index.js";
import { createPaletteKit } from "./index.js";
import { resolveColor, type ResolveColorOptions } from "./engine/resolve/resolve.js";
import { serializeColor } from "./export/serialize.js";

const intents = {
  brand: { hue: 260, chroma: 0.14 },
  neutral: { hue: 0, chroma: 0 },
  success: { hue: 145, chroma: 0.12 },
};

const intentRegistry = createIntentRegistry(intents);
const lightPalette = createPaletteKit({ intents, context: "light" });
const darkPalette = createPaletteKit({ intents, context: "dark" });

const resolveInternal = (options: Partial<ResolveColorOptions> = {}) =>
  resolveColor({
    intentRegistry,
    usage: "fill",
    intent: "brand",
    level: 3,
    systemDefaultContext: "light",
    ...options,
  });

const surface = lightPalette.resolve({
  usage: "fill",
  intent: "neutral",
  level: 2,
});

const fillGoldenOptions = {
  usage: "fill",
  intent: "brand",
  level: 3,
} as const;

const visualVocabularyGoldenOptions = {
  usage: "visualVocabulary",
  intent: "brand",
  on: surface,
} as const;

const linesGoldenOptions = {
  usage: "lines",
  intent: "neutral",
  level: 2,
  on: surface,
} as const;

const overlaysGoldenOptions = {
  usage: "overlays",
  intent: "neutral",
  level: 1,
  under: surface,
} as const;

const goldenCases = [
  {
    name: "solid surface",
    options: fillGoldenOptions,
    expected: Object.freeze({
      space: "oklch",
      l: 94,
      c: 0.14,
      h: 260,
      alpha: 1,
    } satisfies OklchColor),
  },
  {
    name: "visual vocabulary",
    options: visualVocabularyGoldenOptions,
    expected: Object.freeze({
      space: "oklch",
      l: 50,
      c: 0.14,
      h: 260,
      alpha: 1,
    } satisfies OklchColor),
  },
  {
    name: "divider line",
    options: linesGoldenOptions,
    expected: Object.freeze({
      space: "oklch",
      l: 95,
      c: 0,
      h: 0,
      alpha: 1,
    } satisfies OklchColor),
  },
  {
    name: "overlay",
    options: overlaysGoldenOptions,
    expected: Object.freeze({
      space: "oklch",
      l: 50,
      c: 0,
      h: 0,
      alpha: 1,
    } satisfies OklchColor),
  },
] as const;

describe("golden cases", () => {
  it.each(goldenCases)("locks the $name golden output", ({ options, expected }) => {
    expect(lightPalette.resolve(options)).toEqual(expected);
  });

  it("locks representative failure cases", () => {
    expect(() =>
      lightPalette.resolve({
        usage: "visualVocabulary",
        intent: "brand",
      }),
    ).toThrow('Relation "on" is required for usage "visualVocabulary".');

    expect(() =>
      lightPalette.resolve({
        usage: "fill",
        intent: "brand",
      }),
    ).toThrow('Level is required for usage "fill".');
  });
});

describe("determinism invariants", () => {
  it("returns equal public outputs for repeated identical calls", () => {
    const first = lightPalette.resolve(fillGoldenOptions);
    const second = lightPalette.resolve(fillGoldenOptions);

    expect(second).toEqual(first);
  });

  it("returns equal internal outputs for repeated identical calls", () => {
    const options = {
      intentRegistry,
      usage: "fill",
      intent: "brand",
      level: 3,
      systemDefaultContext: "light",
    } satisfies ResolveColorOptions;

    expect(resolveColor(options)).toEqual(resolveColor(options));
  });

  it("does not depend on prior call order", () => {
    const before = lightPalette.resolve(fillGoldenOptions);

    lightPalette.resolve(visualVocabularyGoldenOptions);
    lightPalette.resolve(linesGoldenOptions);
    lightPalette.resolve(overlaysGoldenOptions);
    darkPalette.resolve({ ...fillGoldenOptions, context: "light" });

    expect(lightPalette.resolve(fillGoldenOptions)).toEqual(before);
  });

  it("keeps repeated golden cases stable", () => {
    for (const { options, expected } of goldenCases) {
      expect(lightPalette.resolve(options)).toEqual(expected);
      expect(lightPalette.resolve(options)).toEqual(expected);
      expect(lightPalette.resolve(options)).toEqual(expected);
    }
  });

  it("preserves frozen objects for object outputs", () => {
    expect(Object.isFrozen(lightPalette.resolve(fillGoldenOptions))).toBe(true);
    expect(Object.isFrozen(lightPalette.resolve({ ...fillGoldenOptions, output: "rgba" }))).toBe(
      true,
    );
  });
});

describe("output independence invariants", () => {
  it("keeps internal OKLCH independent from requested public output", () => {
    const internal = resolveInternal(fillGoldenOptions).color;

    expect(lightPalette.resolve(fillGoldenOptions)).toEqual(internal);
    expect(lightPalette.resolve({ ...fillGoldenOptions, output: "hex" })).toBe(
      serializeColor(internal, "hex"),
    );
    expect(lightPalette.resolve({ ...fillGoldenOptions, output: "rgba" })).toEqual(
      serializeColor(internal, "rgba"),
    );
  });

  it("does not let output change semantic errors", () => {
    expect(() =>
      lightPalette.resolve({
        ...fillGoldenOptions,
        intent: "unknown" as "brand",
        output: "hex",
      }),
    ).toThrow('Unknown intent "unknown". Did you forget to register it in the Intent Registry?');

    expect(() =>
      lightPalette.resolve({
        usage: "fill",
        intent: "brand",
        output: "hex",
      }),
    ).toThrow('Level is required for usage "fill".');

    expect(() =>
      lightPalette.resolve({
        usage: "visualVocabulary",
        intent: "brand",
        output: "hex",
      }),
    ).toThrow('Relation "on" is required for usage "visualVocabulary".');
  });
});

describe("axis isolation invariants", () => {
  it("lets level change lightness without changing hue or chroma", () => {
    const lowerLevel = resolveInternal({ level: 2 });
    const higherLevel = resolveInternal({ level: 8 });

    expect(higherLevel.color.l).not.toBe(lowerLevel.color.l);
    expect(higherLevel.color.h).toBe(lowerLevel.color.h);
    expect(higherLevel.color.c).toBe(lowerLevel.color.c);
  });

  it("lets state change lightness without changing semantic axes", () => {
    const base = resolveInternal({ level: 4 });
    const hover = resolveInternal({
      level: 4,
      state: "hover",
      stateDirection: "increase",
    });

    expect(hover.color.l).not.toBe(base.color.l);
    expect(hover.color.h).toBe(base.color.h);
    expect(hover.color.c).toBe(base.color.c);
    expect(hover.axes.usage).toBe(base.axes.usage);
    expect(hover.axes.intent).toBe(base.axes.intent);
  });

  it("does not let context alter OKLCH while context hooks are structural", () => {
    const light = resolveInternal({ resolverContext: "light" });
    const dark = resolveInternal({ resolverContext: "dark" });

    expect(dark.color).toEqual(light.color);
    expect(dark.axes.context).toBe("dark");
    expect(light.axes.context).toBe("light");
    expect(dark.axes.intent).toBe(light.axes.intent);
    expect(dark.axes.usage).toBe(light.axes.usage);
  });

  it("does not let relation targets change usage or intent metadata", () => {
    const fill = resolveInternal({ on: surface });
    const visualVocabulary = resolveInternal({
      usage: "visualVocabulary",
      level: undefined,
      on: surface,
    });
    const overlayOver = resolveInternal({
      usage: "overlays",
      level: 1,
      over: surface,
    });
    const overlayUnder = resolveInternal({
      usage: "overlays",
      level: 1,
      under: surface,
    });

    expect(fill.axes.usage).toBe("fill");
    expect(fill.axes.intent).toBe("brand");
    expect(visualVocabulary.axes.usage).toBe("visualVocabulary");
    expect(visualVocabulary.axes.intent).toBe("brand");
    expect(overlayOver.axes.usage).toBe("overlays");
    expect(overlayOver.axes.intent).toBe("brand");
    expect(overlayUnder.axes.usage).toBe("overlays");
    expect(overlayUnder.axes.intent).toBe("brand");
  });
});
