import { describe, expect, it } from "vitest";

import { createTheme } from "./createTheme.js";
import type { ColorQuery } from "../types/index.js";

describe("Phase 2 helpers", () => {
  const theme = createTheme({
    seeds: {
      light: { neutral: "#8B8D98", accent: "#3D63DD" },
      dark: { neutral: "#8B8D98", accent: "#3D63DD" },
    },
    preset: "modern",
  });

  it("resolveMany preserves input order", () => {
    const queries: ColorQuery[] = [
      { role: "bg.app", usage: "bg", surface: "app", context: "light" },
      { role: "text.primary", usage: "text", surface: "surface", context: "light" },
    ];

    const expected = queries.map((query) => theme.resolve(query));
    const results = theme.resolveMany(queries);

    expect(results.map((result) => result.step)).toEqual(expected.map((result) => result.step));
    expect(results.map((result) => result.seedUsed)).toEqual(
      expected.map((result) => result.seedUsed),
    );
  });

  it("withContext applies bound context and allows overrides", () => {
    const darkTheme = theme.withContext("dark");
    const bound = darkTheme.resolve({ role: "bg.app", usage: "bg", surface: "app" });
    const explicit: ColorQuery = {
      role: "bg.app",
      usage: "bg",
      surface: "app",
      context: "dark",
    };
    const explicitResolved = theme.resolve(explicit);

    expect(bound.step).toBe(explicitResolved.step);

    const override = darkTheme.resolve({
      role: "bg.app",
      usage: "bg",
      surface: "app",
      context: "light",
    });
    const light: ColorQuery = {
      role: "bg.app",
      usage: "bg",
      surface: "app",
      context: "light",
    };
    const lightResolved = theme.resolve(light);

    expect(override.step).toBe(lightResolved.step);
  });

  it("theme.color infers usage and surface from role", () => {
    const inferred = theme.color("bg.app");
    const explicit = theme.resolve({ role: "bg.app", usage: "bg", surface: "app" });

    expect(inferred.step).toBe(explicit.step);
    expect(inferred.seedUsed).toBe(explicit.seedUsed);
  });

  it("theme.color throws in strict mode when inference is missing", () => {
    expect(() =>
      theme.color("custom.role", {
        output: { strict: true },
      }),
    ).toThrow(/Usage is required for role/i);

    expect(() =>
      theme.color("text.custom", {
        output: { strict: true },
      }),
    ).toThrow(/Surface is required for role/i);
  });

});
