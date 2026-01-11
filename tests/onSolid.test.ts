import { describe, expect, it } from "vitest";

import { onSolidTextTokens } from "../src/contrast/onSolid.js";

describe("onSolidTextTokens", () => {
  it("returns rgba hex values", () => {
    const tokens = onSolidTextTokens("#3d63dd");
    expect(tokens.primary).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(tokens.secondary).toMatch(/^#[0-9a-fA-F]{8}$/);
    expect(tokens.disabled).toMatch(/^#[0-9a-fA-F]{8}$/);
  });
});
