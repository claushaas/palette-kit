import { describe, expect, it } from "vitest";

import { normalizeQuery } from "./normalize.js";

describe("normalizeQuery", () => {
  it("applies defaults", () => {
    const result = normalizeQuery({ role: "text.primary" });

    expect(result.usage).toBe("bg");
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
});
