import { describe, expect, it } from "vitest";

import * as publicApi from "../index.js";
import { PaletteKitError } from "../utils/errors/errors.js";
import {
  serializeColor,
  serializeOklchToHex,
  serializeOklchToRgba,
  type SerializationOptions,
} from "./serialize.js";

describe("OKLCH serialization", () => {
  it("serializes neutral OKLCH to RGBA", () => {
    expect(serializeOklchToRgba({ l: 100, c: 0, h: 0, alpha: 0.42 })).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 0.42,
    });

    expect(serializeOklchToRgba({ l: 0, c: 0, h: 0 })).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  it("serializes OKLCH to lowercase HEX without alpha", () => {
    expect(serializeOklchToHex({ l: 100, c: 0, h: 0, alpha: 0.5 })).toBe("#ffffff");
    expect(serializeOklchToHex({ l: 0, c: 0, h: 0 })).toBe("#000000");
  });

  it("uses explicit clip gamut handling for out-of-range sRGB channels", () => {
    const rgba = serializeOklchToRgba({ l: 70, c: 0.4, h: 40 }, { gamutStrategy: "clip" });

    expect(rgba.r).toBeGreaterThanOrEqual(0);
    expect(rgba.r).toBeLessThanOrEqual(255);
    expect(rgba.g).toBeGreaterThanOrEqual(0);
    expect(rgba.g).toBeLessThanOrEqual(255);
    expect(rgba.b).toBeGreaterThanOrEqual(0);
    expect(rgba.b).toBeLessThanOrEqual(255);
  });

  it("rejects unsupported gamut strategies", () => {
    expect(() =>
      serializeOklchToRgba(
        { l: 50, c: 0, h: 0 },
        { gamutStrategy: "compress" } as unknown as SerializationOptions,
      ),
    ).toThrow('Unsupported gamut strategy "compress". Expected "clip".');
  });

  it("rejects invalid OKLCH inputs through canonical validation", () => {
    expect(() => serializeOklchToRgba({ l: 101, c: 0, h: 0 })).toThrow(
      "OKLCH l must be between 0 and 100.",
    );
    expect(() => serializeOklchToHex({ l: 50, c: -0.1, h: 0 })).toThrow(
      "OKLCH c must be greater than or equal to 0.",
    );
  });

  it("dispatches supported output formats", () => {
    expect(serializeColor({ l: 100, c: 0, h: 0 }, "hex")).toBe("#ffffff");
    expect(serializeColor({ l: 0, c: 0, h: 0 }, "rgba")).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  it("stubs unsupported output formats with explicit errors", () => {
    expect(() => serializeColor({ l: 50, c: 0, h: 0 }, "p3")).toThrow(
      'Unsupported color output "p3" in Phase 10 serializer.',
    );
    expect(() => serializeColor({ l: 50, c: 0, h: 0 }, "p3")).toThrow(PaletteKitError);
    expect(() => serializeColor({ l: 50, c: 0, h: 0 }, "oklab")).toThrow(
      'Unsupported color output "oklab" in Phase 10 serializer.',
    );
  });

  it("keeps serializer APIs internal to the package entrypoint", () => {
    expect(Object.keys(publicApi)).toEqual([]);
  });
});
