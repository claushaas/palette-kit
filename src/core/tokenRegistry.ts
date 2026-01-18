import { normalizeQuery } from "../engine/normalize.js";
import type { BaseResolvedColor } from "../engine/resolveBaseColor.js";
import type { TokenDefinition, TokenRegistry, TokenState } from "../types/index.js";
import type { PaletteTheme } from "./createTheme.js";

const ALLOWED_TOKEN_STATES: TokenState[] = ["hover", "active", "selected", "focus", "disabled"];

const validateTokenStates = (states: TokenDefinition["states"], name: string) => {
  if (!states) return;

  for (const [state, enabled] of Object.entries(states)) {
    if (enabled !== true) {
      throw new Error(`Token "${name}" state "${state}" must be true`);
    }

    if (!ALLOWED_TOKEN_STATES.includes(state as TokenState)) {
      throw new Error(`Invalid token state "${state}" for "${name}"`);
    }
  }
};

/**
 * Validate a token definition for safe registry usage.
 *
 * Guarantees (Phase 3):
 * - registry stays declarative (no output options / no embedded color literals)
 * - tokens are base tokens (interactive states declared via `token.states`)
 */
export const validateTokenDefinition = (token: TokenDefinition): void => {
  if (!token.name.trim()) {
    throw new Error("Token name is required");
  }

  if (!token.query?.role?.trim()) {
    throw new Error(`Token "${token.name}" requires a query role`);
  }

  if (!token.query.usage) {
    throw new Error(`Token "${token.name}" requires a usage`);
  }

  if (!token.query.surface) {
    throw new Error(`Token "${token.name}" requires a surface`);
  }

  if (token.query.state && token.query.state !== "default") {
    throw new Error(
      `Token "${token.name}" must not encode state in query; declare supported states via token.states`,
    );
  }

  if (token.query.on?.kind === "color") {
    throw new Error(
      `Token "${token.name}" must not include a literal background color hint; use { kind: "role" } or { kind: "auto" }`,
    );
  }

  if (token.query.output) {
    throw new Error(`Token "${token.name}" must not include output options`);
  }

  validateTokenStates(token.states, token.name);

  // Delegate to core validation for strict field validation.
  normalizeQuery({ ...token.query, output: { strict: true } });
};

/**
 * Validate a token registry and each token definition it contains.
 */
export const validateTokenRegistry = (registry: TokenRegistry): void => {
  const entries = Object.entries(registry.tokens);

  if (entries.length === 0) {
    throw new Error("Token registry must include at least one token");
  }

  for (const [name, token] of entries) {
    if (token.name !== name) {
      throw new Error(`Token name mismatch: expected "${name}", got "${token.name}"`);
    }
    validateTokenDefinition(token);
  }
};

/**
 * Resolve a token definition through the provided theme.
 */
export const resolveToken = (token: TokenDefinition, theme: PaletteTheme): BaseResolvedColor => {
  validateTokenDefinition(token);
  return theme.resolve(token.query);
};

/**
 * Resolve all tokens in a registry while preserving key order.
 */
export const resolveTokenRegistry = (
  registry: TokenRegistry,
  theme: PaletteTheme,
): Record<string, BaseResolvedColor> => {
  validateTokenRegistry(registry);
  const resolved: Record<string, BaseResolvedColor> = {};

  for (const [name, token] of Object.entries(registry.tokens)) {
    resolved[name] = theme.resolve(token.query);
  }

  return resolved;
};
