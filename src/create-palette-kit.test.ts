import { describe, expect, it } from "vitest";

import * as publicApi from "./index.js";
import {
  createPaletteKit,
  type OklchColor,
  type PaletteResolveOutput,
  type RgbaColor,
} from "./index.js";
import { PaletteKitError } from "./utils/errors/errors.js";

const intents = {
  brand: { hue: 260, chroma: 0.14 },
  neutral: { hue: 0, chroma: 0 },
};

const surfaceOptions = {
  usage: "fill",
  intent: "neutral",
  level: 2,
} as const;

const brandFillOptions = {
  usage: "fill",
  intent: "brand",
  level: 4,
} as const;

describe("public Palette Kit API", () => {
  it("exports createPaletteKit as the only runtime API", () => {
    expect(Object.keys(publicApi)).toEqual(["createPaletteKit"]);
  });

  it("creates an immutable palette with a resolve method", () => {
    const palette = createPaletteKit({ intents, context: "light" });

    expect(Object.isFrozen(palette)).toBe(true);
    expect(typeof palette.resolve).toBe("function");
  });

  it("returns normalized OKLCH by default", () => {
    const palette = createPaletteKit({ intents, context: "light" });
    const color = palette.resolve(brandFillOptions);

    expect(color).toEqual({
      space: "oklch",
      l: 91,
      c: 0.14,
      h: 260,
      alpha: 1,
    } satisfies OklchColor);
  });

  it("uses palette-level output when resolver output is absent", () => {
    const palette = createPaletteKit({ intents, context: "light", output: "rgba" });
    const color = palette.resolve(brandFillOptions);

    expect(color).toEqual({ r: 170, g: 226, b: 255, a: 1 } satisfies RgbaColor);
  });

  it("lets resolver-level output override palette output", () => {
    const palette = createPaletteKit({ intents, context: "light", output: "rgba" });
    const color = palette.resolve({ ...brandFillOptions, output: "hex" });

    expect(color).toBe("#aae2ff");
  });

  it("uses palette-level and resolver-level context explicitly", () => {
    const paletteContext = createPaletteKit({ intents, context: "light" });
    const systemContext = createPaletteKit({ intents, systemDefaultContext: "dark" });
    const resolverContext = createPaletteKit({ intents });

    expect(paletteContext.resolve(brandFillOptions).space).toBe("oklch");
    expect(systemContext.resolve(brandFillOptions).space).toBe("oklch");
    expect(resolverContext.resolve({ ...brandFillOptions, context: "light" }).space).toBe("oklch");
  });

  it("throws the existing context error when context cannot be resolved", () => {
    const palette = createPaletteKit({ intents });

    expect(() => palette.resolve(brandFillOptions)).toThrow(
      "Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.",
    );
    expect(() => palette.resolve(brandFillOptions)).toThrow(PaletteKitError);
  });

  it("propagates resolver misuse errors", () => {
    const palette = createPaletteKit({ intents, context: "light" });
    const surface = palette.resolve(surfaceOptions);

    expect(() => palette.resolve({ ...brandFillOptions, intent: "unknown" as "brand" })).toThrow(
      'Unknown intent "unknown". Did you forget to register it in the Intent Registry?',
    );
    expect(() => palette.resolve({ ...brandFillOptions, usage: "chart" as "fill" })).toThrow(
      'Unknown usage "chart". Expected one of: fill, visualVocabulary, lines, overlays.',
    );
    expect(() => palette.resolve({ usage: "fill", intent: "brand" })).toThrow(
      'Level is required for usage "fill".',
    );
    expect(() =>
      palette.resolve({ usage: "visualVocabulary", intent: "brand", level: 2, on: surface }),
    ).toThrow('Level is not allowed for usage "visualVocabulary".');
    expect(() => palette.resolve({ usage: "visualVocabulary", intent: "brand" })).toThrow(
      'Relation "on" is required for usage "visualVocabulary".',
    );
    expect(() => palette.resolve({ ...brandFillOptions, state: "hover" })).toThrow(
      'stateDirection is required when state is not "default".',
    );
  });

  it("accepts OKLCH results as relation targets", () => {
    const palette = createPaletteKit({ intents, context: "light" });
    const surface = palette.resolve(surfaceOptions);
    const text = palette.resolve({
      usage: "visualVocabulary",
      intent: "brand",
      on: surface,
    });

    expect(text).toEqual({
      space: "oklch",
      l: 50,
      c: 0.14,
      h: 260,
      alpha: 1,
    } satisfies OklchColor);
  });

  it("throws existing unsupported output errors for unimplemented formats", () => {
    const palette = createPaletteKit({ intents, context: "light" });

    expect(() => palette.resolve({ ...brandFillOptions, output: "p3" })).toThrow(
      'Unsupported color output "p3" in Phase 10 serializer.',
    );
    expect(() => palette.resolve({ ...brandFillOptions, output: "p3" })).toThrow(PaletteKitError);
  });

  it("types resolve results by default, palette-level, and resolver-level output", () => {
    const defaultPalette = createPaletteKit({ intents, context: "light" });
    const rgbaPalette = createPaletteKit({ intents, context: "light", output: "rgba" });

    const defaultColor: PaletteResolveOutput<"oklch"> = defaultPalette.resolve(brandFillOptions);
    const rgbaColor: PaletteResolveOutput<"rgba"> = rgbaPalette.resolve(brandFillOptions);
    const hexColor: PaletteResolveOutput<"hex"> = rgbaPalette.resolve({
      ...brandFillOptions,
      output: "hex",
    });

    expect(defaultColor.space).toBe("oklch");
    expect(rgbaColor.a).toBe(1);
    expect(hexColor).toBe("#aae2ff");
  });
});
