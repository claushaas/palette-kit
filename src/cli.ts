#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { CliUsageError, COMMANDS, HELP_TEXT, type ParsedArgs, parseArgs } from "./cli/args.js";
import { generateTokenArtifacts } from "./cli/codegen/tokens.js";
import { buildConfigTemplate, type PaletteConfig } from "./cli/config.js";
import { validateConfig } from "./cli/validate.js";
import { createTheme } from "./core/createTheme.js";
import { validateTokenRegistry } from "./core/tokenRegistry.js";
import type { ThemeTokens } from "./export/exportTheme.js";
import { exportThemeCss, exportThemeJson } from "./export/exportTheme.js";
import { minimalUiTokens, modernUiTokens, radixLikeUiTokens } from "./presets/tokens/index.js";

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

const tokenPresetMap = {
  "minimal-ui": minimalUiTokens,
  "radixLike-ui": radixLikeUiTokens,
  "modern-ui": modernUiTokens,
};

const toThemeTokens = (registry: typeof minimalUiTokens): ThemeTokens =>
  Object.fromEntries(Object.entries(registry.tokens).map(([name, token]) => [name, token.query]));

const writeTokensCodegen = async (outDir: string, registry: typeof minimalUiTokens) => {
  const generated = generateTokenArtifacts(registry);
  await writeFile(join(outDir, "tokens.ts"), generated.tokensTs, "utf8");
  await writeFile(join(outDir, "tokens.d.ts"), generated.tokensDts, "utf8");
  return generated.tokenNames;
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
    throw new Error(`Config already exists at ${filePath}. Use --force to overwrite`);
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
  const tokenNames = await writeTokensCodegen(outDir, registry);

  await writeFile(join(outDir, "tokens.css"), css, "utf8");
  await writeFile(join(outDir, "tokens.json"), `${JSON.stringify(json, null, 2)}\n`, "utf8");

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
      throw new CliUsageError(`Unknown command: ${parsed.command}`);
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
    if (error instanceof CliUsageError) {
      console.error("");
      printHelp();
    }
    process.exitCode = 1;
  }
};

void main();
