#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildConfigTemplate, isTokenPresetName, type PaletteConfig } from "./cli/config.js";
import { createTheme } from "./core/createTheme.js";
import { validateTokenRegistry } from "./core/tokenRegistry.js";
import type { ThemeTokens } from "./export/exportTheme.js";
import { exportThemeCss, exportThemeJson } from "./export/exportTheme.js";
import { minimalUiTokens, modernUiTokens, radixLikeUiTokens } from "./presets/tokens/index.js";

const COMMANDS = ["init", "build"] as const;

type ParsedArgs = {
  command?: string;
  help: boolean;
  version: boolean;
  flags: Record<string, string | boolean>;
};

const HELP_TEXT = `palette-kit <command>

Commands:
  palette-kit init [--force] [--path <dir>]
  palette-kit build [--config <path>] [--outDir <dir>] [--report]

Options:
  -h, --help       Show help
  -v, --version    Show version
`;

const parseArgs = (argv: string[]): ParsedArgs => {
  const [command, ...rest] = argv;
  const flags: Record<string, string | boolean> = {};

  let i = 0;
  while (i < rest.length) {
    const value = rest[i];
    if (value === "-h" || value === "--help") {
      flags.help = true;
      i += 1;
      continue;
    }
    if (value === "-v" || value === "--version") {
      flags.version = true;
      i += 1;
      continue;
    }
    if (value.startsWith("--")) {
      const key = value.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i += 1;
      }
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }

  return {
    command,
    help: Boolean(flags.help),
    version: Boolean(flags.version),
    flags,
  };
};

const readPackageJson = async () => {
  const url = new URL("../package.json", import.meta.url);
  const content = await readFile(url, "utf8");
  return JSON.parse(content) as { name: string; version: string };
};

const printHelp = () => {
  console.log(HELP_TEXT);
};

const printVersion = async () => {
  const pkg = await readPackageJson();
  console.log(pkg.version);
};

const ensureDir = async (dir: string) => {
  await mkdir(dir, { recursive: true });
};

const exists = async (filePath: string) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const loadConfig = async (configPath: string): Promise<PaletteConfig> => {
  const resolved = resolve(configPath);
  try {
    const module = await import(pathToFileURL(resolved).href);
    const config = (module.default ?? module) as PaletteConfig;
    return config;
  } catch (error) {
    const suffix = resolved.endsWith(".ts")
      ? "\nTip: Use a .mjs config or run Node with a TS loader (e.g. tsx)."
      : "";
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to load config at ${resolved}. ${message}${suffix}`);
  }
};

const validateConfig = (config: PaletteConfig) => {
  if (!config || typeof config !== "object") {
    throw new Error("Config must export a default object");
  }
  if (!config.theme) {
    throw new Error("Config.theme is required");
  }
  if (!config.theme.seeds?.light || !config.theme.seeds?.dark) {
    throw new Error("Config.theme.seeds.light and .dark are required");
  }
  if (!config.tokens?.preset) {
    throw new Error("Config.tokens.preset is required");
  }
  if (!isTokenPresetName(config.tokens.preset)) {
    throw new Error(`Unsupported token preset: ${config.tokens.preset}`);
  }
};

const tokenPresetMap = {
  "minimal-ui": minimalUiTokens,
  "radixLike-ui": radixLikeUiTokens,
  "modern-ui": modernUiTokens,
};

const toThemeTokens = (registry: typeof minimalUiTokens): ThemeTokens =>
  Object.fromEntries(Object.entries(registry.tokens).map(([name, token]) => [name, token.query]));

const writeTokensTs = async (
  outDir: string,
  data: ReturnType<typeof exportThemeJson>,
  tokenNames: string[],
) => {
  const tokensJson = JSON.stringify(data.tokens, null, 2);
  const metaJson = data.meta ? JSON.stringify(data.meta, null, 2) : null;

  const metaLine = metaJson ? `export const meta = ${metaJson} as const;\n` : "";
  const contents = `export const tokens = ${tokensJson} as const;\nexport const tokenNames = ${JSON.stringify(
    tokenNames,
    null,
    2,
  )} as const;\nexport type TokenName = (typeof tokenNames)[number];\n${metaLine}`;

  await writeFile(join(outDir, "tokens.ts"), contents, "utf8");

  const dtsContents = `export type TokenValue = {\n  value: string;\n  srgb?: string;\n  p3?: string;\n  oklch?: string;\n  alpha: number;\n  meta?: Record<string, unknown>;\n};\n\nexport type TokensByContext = {\n  light: Record<string, TokenValue>;\n  dark: Record<string, TokenValue>;\n};\n\nexport declare const tokens: TokensByContext;\nexport declare const tokenNames: readonly string[];\nexport type TokenName = (typeof tokenNames)[number];\nexport type ExportMeta = {\n  gamutMapping: string;\n  preferSpace: string;\n  includeSpaces: string[];\n  precision: { l: number; c: number; h: number; alpha: number };\n  srgbFormat: string;\n  strict: boolean;\n};\nexport declare const meta: ExportMeta | undefined;\n`;

  await writeFile(join(outDir, "tokens.d.ts"), dtsContents, "utf8");
};

const writeReport = async (
  outDir: string,
  config: PaletteConfig,
  tokenCount: number,
  outputFiles: string[],
) => {
  const lines = [
    "# Palette Kit Report",
    "",
    `- preset: ${config.tokens.preset}`,
    `- tokens: ${tokenCount}`,
    `- output: preferSpace=${config.output?.preferSpace ?? "oklch"}`,
    `- includeSpaces: ${(config.output?.includeSpaces ?? []).join(", ") || "(none)"}`,
    `- files: ${outputFiles.join(", ")}`,
  ];

  await writeFile(join(outDir, "report.md"), `${lines.join("\n")}\n`, "utf8");
};

const runInit = async (flags: ParsedArgs["flags"]) => {
  const targetPath = typeof flags.path === "string" ? flags.path : ".";
  const force = Boolean(flags.force);
  const outDir = resolve(targetPath);
  await ensureDir(outDir);

  const filePath = join(outDir, "palette.config.ts");
  if (!force && (await exists(filePath))) {
    throw new Error(`Config already exists at ${filePath}. Use --force to overwrite.`);
  }

  const pkg = await readPackageJson();
  await writeFile(filePath, buildConfigTemplate(pkg.name), "utf8");

  console.log(`Created ${filePath}`);
};

const runBuild = async (flags: ParsedArgs["flags"]) => {
  const configPath = typeof flags.config === "string" ? flags.config : "palette.config.ts";
  const outDir = resolve(typeof flags.outDir === "string" ? flags.outDir : "dist/palette");
  const report = Boolean(flags.report);

  const config = await loadConfig(configPath);
  validateConfig(config);

  const registry = tokenPresetMap[config.tokens.preset];
  validateTokenRegistry(registry);

  const theme = createTheme(config.theme);
  const tokens = toThemeTokens(registry);

  const css = exportThemeCss(theme, tokens, config.output).css;
  const json = exportThemeJson(theme, tokens, config.output);

  await ensureDir(outDir);
  const tokenNames = Object.keys(tokens).sort();

  await writeFile(join(outDir, "tokens.css"), css, "utf8");
  await writeFile(join(outDir, "tokens.json"), `${JSON.stringify(json, null, 2)}\n`, "utf8");
  await writeTokensTs(outDir, json, tokenNames);

  if (report) {
    await writeReport(outDir, config, tokenNames.length, [
      "tokens.css",
      "tokens.json",
      "tokens.ts",
      "tokens.d.ts",
    ]);
  }

  console.log(`Wrote ${basename(outDir)}/tokens.css, tokens.json, tokens.ts, tokens.d.ts`);
};

const main = async () => {
  try {
    const parsed = parseArgs(process.argv.slice(2));

    if (parsed.version) {
      await printVersion();
      return;
    }

    if (parsed.help || !parsed.command) {
      printHelp();
      return;
    }

    if (!COMMANDS.includes(parsed.command as (typeof COMMANDS)[number])) {
      throw new Error(`Unknown command: ${parsed.command}`);
    }

    if (parsed.command === "init") {
      await runInit(parsed.flags);
      return;
    }

    if (parsed.command === "build") {
      await runBuild(parsed.flags);
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    printHelp();
    process.exitCode = 1;
  }
};

void main();
