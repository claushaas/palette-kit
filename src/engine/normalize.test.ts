import { describe, expect, it, vi } from "vitest";

import { normalizeQuery } from "./normalize.js";

describe("normalizeQuery", () => {
  it("applies defaults", () => {
    const result = normalizeQuery({ role: "text.primary" });

    expect(result.usage).toBe("text");
    expect(result.context).toBe("light");
    expect(result.surface).toBe("surface");
    expect(result.state).toBe("default");
    expect(result.emphasis).toBe("default");
  });

  it("throws when role is missing", () => {
    expect(() => normalizeQuery({} as never)).toThrowError(/role/i);
  });

  it("applies output defaults", () => {
    const result = normalizeQuery({ role: "text.primary" });

    expect(result.output.preferSpace).toBe("oklch");
    expect(result.output.gamutMapping).toBe("preferP3ThenCompress");
    expect(result.output.precision).toMatchObject({ l: 1, c: 3, h: 1 });
    expect(result.output.strict).toBe(false);
    expect(result.output.includeMeta).toBe(false);
  });

  it("infers usage from role prefixes", () => {
    expect(normalizeQuery({ role: "icon.primary" }).usage).toBe("icon");
    expect(normalizeQuery({ role: "border.muted" }).usage).toBe("border");
    expect(normalizeQuery({ role: "bg.canvas" }).usage).toBe("bg");
    expect(normalizeQuery({ role: "ring.focus" }).usage).toBe("ring");
    expect(normalizeQuery({ role: "chart.axis.stroke" }).usage).toBe("stroke");
    expect(normalizeQuery({ role: "chart.fill.primary" }).usage).toBe("fill");
    expect(normalizeQuery({ role: "chart.grid.muted" }).usage).toBe("border");
    expect(normalizeQuery({ role: "chart.label" }).usage).toBe("text");
  });

  it("requires usage when strict and inference fails", () => {
    expect(() =>
      normalizeQuery({ role: "brand.primary", output: { strict: true } }),
    ).toThrowError(/usage/i);
  });

  it("warns when usage cannot be inferred in non-strict mode", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(normalizeQuery({ role: "brand.primary" }).usage).toBe("bg");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Defaulting usage to "bg"'),
    );

    warnSpy.mockRestore();
  });

  it("validates background hint color values", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(
      normalizeQuery({ role: "bg.canvas", on: { kind: "color", value: "#fff" } }).on,
    ).toEqual({ kind: "color", value: "#fff" });
    expect(
      normalizeQuery({
        role: "bg.canvas",
        on: { kind: "color", value: "oklch(62% 0.18 265)" },
      }).on,
    ).toEqual({ kind: "color", value: "oklch(62% 0.18 265)" });
    expect(
      normalizeQuery({
        role: "bg.canvas",
        on: { kind: "color", value: "color(display-p3 1 0.5 0.25)" },
      }).on,
    ).toEqual({ kind: "color", value: "color(display-p3 1 0.5 0.25)" });
    expect(
      normalizeQuery({ role: "bg.canvas", on: { kind: "color", value: "banana" } }).on,
    ).toEqual({ kind: "color", value: "banana" });

    expect(warnSpy).toHaveBeenCalledTimes(3);
    warnSpy.mockRestore();
  });

  it("normalizes nested background hints", () => {
    expect(
      normalizeQuery({ role: "bg.canvas", on: { kind: "role", role: " text.primary " } })
        .on,
    ).toEqual({ kind: "role", role: "text.primary" });
    expect(normalizeQuery({ role: "bg.canvas", on: { kind: "auto" } }).on).toEqual({
      kind: "auto",
    });
    expect(() =>
      normalizeQuery({ role: "bg.canvas", on: { kind: "color", value: "   " } }),
    ).toThrowError(/color value is required/i);
    expect(() =>
      normalizeQuery({
        role: "bg.canvas",
        on: { kind: "color", value: "banana" },
        output: { strict: true },
      }),
    ).toThrowError(/background hint color value/i);
    expect(() =>
      normalizeQuery({ role: "bg.canvas", on: { kind: "nope" } as never }),
    ).toThrowError(/background hint kind/i);
  });

  it("validates contrast requirements", () => {
    expect(
      normalizeQuery({ role: "text.primary", contrast: { model: "apca", targetLc: 75 } })
        .contrast,
    ).toEqual({ model: "apca", targetLc: 75 });
    expect(
      normalizeQuery({ role: "text.primary", contrast: { model: "wcag2", minRatio: 4.5 } })
        .contrast,
    ).toEqual({ model: "wcag2", minRatio: 4.5 });
    expect(
      normalizeQuery({ role: "text.primary", contrast: { model: "none" } }).contrast,
    ).toEqual({ model: "none" });
    expect(() =>
      normalizeQuery({ role: "text.primary", contrast: { model: "apca" } as never }),
    ).toThrowError(/targetLc/i);
    expect(() =>
      normalizeQuery({ role: "text.primary", contrast: { model: "wcag2" } as never }),
    ).toThrowError(/minRatio/i);
    expect(() =>
      normalizeQuery({ role: "text.primary", contrast: { model: "nope" } as never }),
    ).toThrowError(/contrast model/i);
  });

  it("validates alpha strategies", () => {
    expect(
      normalizeQuery({ role: "bg.canvas", alpha: { mode: "none" } }).alpha,
    ).toEqual({ mode: "none" });
    expect(
      normalizeQuery({ role: "bg.canvas", alpha: { mode: "fixed", alpha: 0.5 } }).alpha,
    ).toEqual({ mode: "fixed", alpha: 0.5 });
    expect(
      normalizeQuery({ role: "bg.canvas", alpha: { mode: "solveOnBackground" } }).alpha,
    ).toEqual({ mode: "solveOnBackground" });
    expect(() =>
      normalizeQuery({ role: "bg.canvas", alpha: { mode: "fixed" } as never }),
    ).toThrowError(/fixed alpha/i);
    expect(() =>
      normalizeQuery({ role: "bg.canvas", alpha: { mode: "nope" } as never }),
    ).toThrowError(/alpha strategy mode/i);
  });
});
