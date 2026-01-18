import { isTokenPresetName, type PaletteConfig } from "./config.js";

const validateSeed = (context: "light" | "dark", value: unknown) => {
  if (!value || typeof value !== "object") {
    throw new Error(`Config.theme.seeds.${context} must be an object`);
  }
  const seed = value as Record<string, unknown>;
  if (typeof seed.neutral !== "string") {
    throw new Error(`Config.theme.seeds.${context}.neutral must be a string color`);
  }
  if (typeof seed.accent !== "string") {
    throw new Error(`Config.theme.seeds.${context}.accent must be a string color`);
  }
};

export const validateConfig = (config: PaletteConfig) => {
  if (!config || typeof config !== "object") {
    throw new Error("Config must export a default object");
  }
  if (!config.theme) {
    throw new Error("Config.theme is required");
  }

  const seeds = config.theme.seeds;
  if (!seeds?.light || !seeds?.dark) {
    throw new Error("Config.theme.seeds.light and .dark are required");
  }

  validateSeed("light", seeds.light);
  validateSeed("dark", seeds.dark);

  if (!config.tokens?.preset) {
    throw new Error("Config.tokens.preset is required");
  }
  if (!isTokenPresetName(config.tokens.preset)) {
    throw new Error(`Unsupported token preset: ${config.tokens.preset}`);
  }
};
