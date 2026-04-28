import { describe, expect, it } from "vitest";

import type { OklchColor } from "../core/oklch.js";
import * as publicApi from "../index.js";
import { PaletteKitError } from "../utils/errors/errors.js";
import {
  assertColorOutput,
  isColorOutput,
  OUTPUTS,
  resolveOutput,
  type ResolveOutput,
  type RgbaColor,
  type TypedResolver,
} from "./types.js";

const invalidOutputError = 'Invalid output "css". Expected one of: oklch, oklab, srgb, p3, hex, rgba.';

describe("output validation", () => {
  it("accepts canonical outputs", () => {
    for (const output of OUTPUTS) {
      expect(isColorOutput(output)).toBe(true);
      expect(() => assertColorOutput(output)).not.toThrow();
    }
  });

  it("rejects unknown outputs and non-string values", () => {
    expect(isColorOutput("css")).toBe(false);
    expect(isColorOutput("")).toBe(false);
    expect(isColorOutput(null)).toBe(false);
    expect(isColorOutput(1)).toBe(false);
    expect(isColorOutput({ output: "hex" })).toBe(false);
  });

  it("throws a clear error for invalid outputs", () => {
    expect(() => assertColorOutput("css")).toThrow(invalidOutputError);
    expect(() => assertColorOutput("css")).toThrow(PaletteKitError);
  });

  it("freezes canonical outputs", () => {
    expect(Object.isFrozen(OUTPUTS)).toBe(true);
  });
});

describe("output precedence", () => {
  it("prefers resolver output over palette and system defaults", () => {
    expect(
      resolveOutput({
        resolverOutput: "hex",
        paletteOutput: "rgba",
        systemDefaultOutput: "oklch",
      }),
    ).toBe("hex");
  });

  it("prefers palette output over system default", () => {
    expect(resolveOutput({ paletteOutput: "rgba", systemDefaultOutput: "oklch" })).toBe("rgba");
  });

  it("uses system default when resolver and palette outputs are absent", () => {
    expect(resolveOutput({ systemDefaultOutput: "hex" })).toBe("hex");
  });

  it("falls back to oklch when no output is provided", () => {
    expect(resolveOutput({})).toBe("oklch");
  });

  it("rejects invalid outputs at any provided level", () => {
    expect(() => resolveOutput({ resolverOutput: "css" })).toThrow(invalidOutputError);
    expect(() => resolveOutput({ resolverOutput: "hex", paletteOutput: "css" })).toThrow(
      invalidOutputError,
    );
    expect(() =>
      resolveOutput({ resolverOutput: "hex", paletteOutput: "rgba", systemDefaultOutput: "css" }),
    ).toThrow(invalidOutputError);
  });
});

describe("output typing", () => {
  it("maps output names to concrete return types", () => {
    const hex = "#ffffff" satisfies ResolveOutput<"hex">;
    const rgba = { r: 255, g: 255, b: 255, a: 1 } satisfies ResolveOutput<"rgba">;
    const oklch = {
      space: "oklch",
      l: 100,
      c: 0,
      h: 0,
      alpha: 1,
    } satisfies ResolveOutput<"oklch">;

    expect(hex).toBe("#ffffff");
    expect(rgba).toEqual({ r: 255, g: 255, b: 255, a: 1 } satisfies RgbaColor);
    expect(oklch).toEqual({
      space: "oklch",
      l: 100,
      c: 0,
      h: 0,
      alpha: 1,
    } satisfies OklchColor);
  });

  it("types resolver outputs by selected output format", () => {
    const resolver: TypedResolver<"hex"> = () => "#ffffff";
    const result: string = resolver({ output: "hex" });

    expect(result).toBe("#ffffff");
  });

  it("does not expose output typing APIs from the public entrypoint", () => {
    expect(Object.keys(publicApi)).toEqual(["createPaletteKit"]);
  });
});
