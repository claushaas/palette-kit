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

  it("adds text tokens for light and dark backgrounds", () => {
    const theme = createTheme(options);
    expect(theme.tokens.light["text.dark.primary"]).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(theme.tokens.light["text.light.primary"]).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("generates alpha scale by default", () => {
    const theme = createTheme(options);
    expect(theme.alpha?.neutral.light[1]).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(theme.alpha?.accent.dark[12]).toMatch(/^#[0-9a-fA-F]{8}$/);
  });

  it("provides overlay scales", () => {
    const theme = createTheme(options);
    expect(theme.overlay.black[1]).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(theme.overlay.white[12]).toMatch(/^#[0-9a-fA-F]{8}$/);
  });
});
