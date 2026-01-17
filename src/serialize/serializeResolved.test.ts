import { describe, expect, it } from "vitest";

import { createTheme } from "../core/createTheme.js";
import { serializeColor, serializeResolved } from "./serializeColor.js";

describe("serializeResolved", () => {
  it("includes resolver metadata when includeMeta is true", () => {
    const resolved = {
      oklch: { l: 60, c: 0.2, h: 40, alpha: 0.5 },
      step: 7,
      variantUsed: "accent",
      seedUsed: "#123456",
    };

    const result = serializeResolved(resolved, { includeMeta: true, preferSpace: "oklch" });

    expect(result.meta?.step).toBe(7);
    expect(result.meta?.variantUsed).toBe("accent");
    expect(result.meta?.seedUsed).toBe("#123456");
    expect(result.meta?.spaceUsed).toBe("oklch");
    expect(result.meta?.gamutMapping).toBe("preferP3ThenCompress");
  });
});

describe("serializeColor", () => {
  it("uses rgba output when explicitly requested", () => {
    const color = { l: 60, c: 0.2, h: 40, alpha: 0.5 };
    const result = serializeColor(color, { preferSpace: "srgb", srgbFormat: "rgb" });

    expect(result.value.startsWith("rgba(")).toBe(true);
  });
});

describe("theme.serialize", () => {
  it("serializes a resolved query using the theme", () => {
    const theme = createTheme({
      seeds: {
        light: { neutral: "#8B8D98", accent: "#3D63DD" },
        dark: { neutral: "#8B8D98", accent: "#3D63DD" },
      },
      preset: "modern",
    });

    const result = theme.serialize(
      {
        role: "bg.solid",
        usage: "bg",
        surface: "solid",
        context: "light",
      },
      { preferSpace: "oklch" },
    );

    expect(result.value.startsWith("oklch(")).toBe(true);
    expect(result.alpha).toBeGreaterThanOrEqual(0);
  });
});
