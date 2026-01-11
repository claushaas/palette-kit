import { describe, expect, it } from "vitest";

import { createTheme } from "../src/createTheme.js";
import { toCssVars } from "../src/exporters/toCssVars.js";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  p3: true,
});

describe("toCssVars", () => {
  it("includes token variables", () => {
    const css = toCssVars(theme, { prefix: "pk" });
    expect(css).toContain("--pk-bg-app");
  });

  it("includes scale variables", () => {
    const css = toCssVars(theme, { prefix: "pk" });
    expect(css).toContain("--pk-scale-neutral-1");
    expect(css).toContain("--pk-scale-accent-9");
  });

  it("includes alpha variables", () => {
    const css = toCssVars(theme, { prefix: "pk" });
    expect(css).toContain("--pk-alpha-1");
    expect(css).toContain("--pk-alpha-12");
  });

  it("includes display-p3 overrides", () => {
    const css = toCssVars(theme, { prefix: "pk", includeP3: true });
    expect(css).toContain("@supports (color: color(display-p3 1 1 1))");
  });
});
