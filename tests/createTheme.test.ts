import { describe, expect, it } from "vitest";

import { createTheme } from "../src/createTheme.js";

const options = {
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  semantic: {
    success: { source: "seed", value: "#16a34a" },
  },
} as const;

describe("createTheme", () => {
  it("returns tokens for light/dark", () => {
    const theme = createTheme(options);
    expect(Object.keys(theme.tokens.light).length).toBeGreaterThan(0);
    expect(Object.keys(theme.tokens.dark).length).toBeGreaterThan(0);
  });

  it("adds onSolid tokens", () => {
    const theme = createTheme(options);
    expect(theme.tokens.light["onSolid.primary"]).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(theme.tokens.dark["onSolid.primary"]).toMatch(/^#[0-9a-fA-F]{8}$/);
  });

  it("generates alpha scale by default", () => {
    const theme = createTheme(options);
    expect(theme.alpha?.light[1]).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(theme.alpha?.dark[12]).toMatch(/^#[0-9a-fA-F]{8}$/);
  });
});
