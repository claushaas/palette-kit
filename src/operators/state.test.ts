import { describe, expect, it } from "vitest";

import { applyStateOperator } from "./state.js";

const base = {
  oklch: { l: 60, c: 0.12, h: 210 },
  context: "light" as const,
  surface: "surface" as const,
  usage: "bg" as const,
  state: "default" as const,
  emphasis: "default" as const,
  preset: "modern" as const,
  step: 9,
};

describe("applyStateOperator", () => {
  it("darkens hover in light context", () => {
    const result = applyStateOperator({ ...base, state: "hover" });

    expect(result.l).toBeLessThan(base.oklch.l);
  });

  it("lightens hover in dark context", () => {
    const result = applyStateOperator({ ...base, context: "dark", state: "hover" });

    expect(result.l).toBeGreaterThan(base.oklch.l);
  });

  it("active is stronger than hover", () => {
    const hover = applyStateOperator({ ...base, state: "hover" });
    const active = applyStateOperator({ ...base, state: "active" });

    expect(Math.abs(active.l - base.oklch.l)).toBeGreaterThan(Math.abs(hover.l - base.oklch.l));
  });

  it("selected is less aggressive than active", () => {
    const selected = applyStateOperator({ ...base, state: "selected" });
    const active = applyStateOperator({ ...base, state: "active" });

    expect(Math.abs(selected.l - base.oklch.l)).toBeLessThan(Math.abs(active.l - base.oklch.l));
  });

  it("disabled reduces chroma", () => {
    const disabled = applyStateOperator({ ...base, state: "disabled" });

    expect(disabled.c).toBeLessThan(base.oklch.c * 0.6);
  });

  it("focus only affects ring and border usage", () => {
    const bgFocus = applyStateOperator({ ...base, usage: "bg", state: "focus" });
    const ringFocus = applyStateOperator({ ...base, usage: "ring", state: "focus" });

    expect(bgFocus.l).toBeCloseTo(base.oklch.l, 6);
    expect(ringFocus.l).not.toBeCloseTo(base.oklch.l, 6);
  });
});
