import { describe, expect, it } from "vitest";

import { serializeColor } from "../export/serializeColor.js";
import { createTheme } from "./createTheme.js";

const buildTheme = () =>
  createTheme({
    seeds: {
      light: { neutral: "#111827", accent: "#3d63dd" },
      dark: { neutral: "#111827", accent: "#3d63dd" },
    },
  });

const toOklchString = (oklch: { l: number; c: number; h: number; alpha?: number }) =>
  serializeColor(oklch, { preferSpace: "oklch", includeMeta: true });

describe("QA v1", () => {
  it("resolves light/dark background without NaNs", () => {
    const theme = buildTheme();

    const light = theme.resolve({
      role: "bg.app",
      usage: "bg",
      context: "light",
      surface: "app",
    });
    const dark = theme.resolve({
      role: "bg.app",
      usage: "bg",
      context: "dark",
      surface: "app",
    });

    const lightSerialized = toOklchString(light.oklch);
    const darkSerialized = toOklchString(dark.oklch);

    expect(typeof lightSerialized.value).toBe("string");
    expect(lightSerialized.value.includes("oklch(")).toBe(true);
    expect(Number.isFinite(lightSerialized.alpha)).toBe(true);
    expect(lightSerialized.alpha).toBeGreaterThanOrEqual(0);
    expect(lightSerialized.alpha).toBeLessThanOrEqual(1);

    expect(typeof darkSerialized.value).toBe("string");
    expect(darkSerialized.value.includes("oklch(")).toBe(true);
    expect(Number.isFinite(darkSerialized.alpha)).toBe(true);
    expect(darkSerialized.alpha).toBeGreaterThanOrEqual(0);
    expect(darkSerialized.alpha).toBeLessThanOrEqual(1);
  });

  it("solves primary/secondary text on solid backgrounds", () => {
    const theme = buildTheme();

    const primary = theme.onSolid({
      bgRole: "action.primary",
      usage: "text",
      context: "light",
      contrast: { model: "apca", targetLc: 75 },
    });
    const secondary = theme.onSolid({
      bgRole: "action.primary",
      usage: "text",
      context: "light",
      contrast: { model: "apca", targetLc: 60 },
    });

    const primarySerialized = toOklchString(primary.oklch);
    const secondarySerialized = toOklchString(secondary.oklch);

    expect(primarySerialized.value).not.toBe("");
    expect(primarySerialized.alpha).toBeGreaterThanOrEqual(0);
    expect(primarySerialized.alpha).toBeLessThanOrEqual(1);

    expect(secondarySerialized.value).not.toBe("");
    expect(secondarySerialized.alpha).toBeGreaterThanOrEqual(0);
    expect(secondarySerialized.alpha).toBeLessThanOrEqual(1);
  });

  it("handles solid button states and onSolid text", () => {
    const theme = buildTheme();
    const base = {
      role: "action.primary",
      usage: "bg" as const,
      surface: "solid" as const,
      context: "light" as const,
    };

    const states = ["default", "hover", "active"] as const;
    const serializedStates = states.map((state) =>
      toOklchString(theme.resolve({ ...base, state }).oklch).value,
    );

    serializedStates.forEach((value) => {
      expect(value.startsWith("oklch(")).toBe(true);
    });

    const onSolidText = toOklchString(
      theme.onSolid({ bgRole: "action.primary", usage: "text", context: "light" }).oklch,
    );

    expect(onSolidText.alpha).toBeGreaterThanOrEqual(0.85);
    expect(onSolidText.alpha).toBeLessThanOrEqual(1);
  });

  it("produces a distinct focus ring color with meta", () => {
    const theme = buildTheme();

    const ring = toOklchString(
      theme.resolve({
        role: "focus.ring",
        variant: "accent",
        usage: "ring",
        context: "light",
        surface: "surface",
        contrast: { model: "apca", targetLc: 45 },
      }).oklch,
    );

    const surface = toOklchString(
      theme.resolve({
        role: "surface.card",
        usage: "bg",
        context: "light",
        surface: "surface",
      }).oklch,
    );

    expect(ring.value).not.toBe(surface.value);
    expect(ring.meta?.gamutMapping).toBeDefined();
  });

  it("keeps overlay scrim alpha stable", () => {
    const theme = buildTheme();

    const scrim = toOklchString(
      theme.resolve({
        role: "overlay.scrim",
        usage: "bg",
        surface: "overlay",
        context: "dark",
        alpha: { mode: "fixed", alpha: 0.55 },
      }).oklch,
    );

    expect(scrim.alpha).toBeGreaterThanOrEqual(0);
    expect(scrim.alpha).toBeLessThanOrEqual(1);
    expect(scrim.value.includes("oklch(")).toBe(true);
    expect(scrim.value.includes("NaN")).toBe(false);
  });
});
