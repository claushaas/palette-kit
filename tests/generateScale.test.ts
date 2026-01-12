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

  it("supports auto anchor per mode", () => {
    const scale = generateScale({ source: seed, anchorStep: "auto" });
    expect(scale.meta?.anchorSteps?.light).toBeDefined();
    expect(scale.meta?.anchorSteps?.dark).toBeDefined();
    expect([8, 9, 10]).toContain(scale.meta?.anchorSteps?.light);
    expect([8, 9, 10]).toContain(scale.meta?.anchorSteps?.dark);
  });

  it("respects explicit anchor steps per mode", () => {
    const scale = generateScale({ source: seed, anchorStep: { light: 8, dark: 10 } });
    expect(scale.meta?.anchorSteps).toEqual({ light: 8, dark: 10 });
  });
});
