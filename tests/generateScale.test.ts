import { describe, expect, it } from "vitest";

import { generateScale } from "../src/generateScale.js";

const seed = { source: "seed", value: "#3d63dd" } as const;

describe("generateScale", () => {
  it("returns deterministic output", () => {
    const a = generateScale({ source: seed });
    const b = generateScale({ source: seed });
    expect(a).toEqual(b);
  });

  it("returns 12 steps for light/dark", () => {
    const scale = generateScale({ source: seed });
    expect(Object.keys(scale.light)).toHaveLength(12);
    expect(Object.keys(scale.dark)).toHaveLength(12);
  });

  it("returns hex colors", () => {
    const scale = generateScale({ source: seed });
    expect(scale.light[9]).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(scale.dark[9]).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("includes P3 values when enabled", () => {
    const scale = generateScale({ source: seed, p3: true });
    expect(scale.p3?.light[9]).toMatch(/^color\(display-p3 /);
    expect(scale.p3?.dark[9]).toMatch(/^color\(display-p3 /);
  });
});
