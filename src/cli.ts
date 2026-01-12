#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { CreateThemeOptions } from "./createTheme.js";
import { createTheme } from "./createTheme.js";
import { toTs, toTsWithMode } from "./exporters/toTs.js";

type Mode = "srgb" | "p3";

const DEFAULT_CONFIG_FILES = [
  "palette.config.mjs",
  "palette.config.js",
  "palette.config.cjs",
  "palette.config.json",
];

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

if (command !== "generate") {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

const options = parseArgs(args.slice(1));
const configPath = resolveConfigPath(options.configPath);
const outPath = path.resolve(process.cwd(), options.outPath ?? "src/theme.ts");
const mode = options.mode;

const config = await loadConfig(configPath);
if (!config || typeof config !== "object") {
  console.error("Config must export a plain object with createTheme options.");
  process.exit(1);
}
if (!("neutral" in config) || !("accent" in config)) {
  console.error("Config must include at least `neutral` and `accent` sources.");
  process.exit(1);
}

const theme = createTheme(config as CreateThemeOptions);
const ts = mode ? toTsWithMode(theme, mode) : toTs(theme);

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, ts);

console.log(`Generated ${path.relative(process.cwd(), outPath)}`);

type CliOptions = {
  configPath?: string;
  outPath?: string;
  mode?: Mode;
};

function parseArgs(input: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < input.length; i += 1) {
    const arg = input[i];
    if (arg === "--config" || arg === "-c") {
      options.configPath = input[i + 1];
      i += 1;
      continue;
    }
    if (arg?.startsWith("--config=")) {
      options.configPath = arg.split("=")[1];
      continue;
    }
    if (arg === "--out" || arg === "-o") {
      options.outPath = input[i + 1];
      i += 1;
      continue;
    }
    if (arg?.startsWith("--out=")) {
      options.outPath = arg.split("=")[1];
      continue;
    }
    if (arg === "--mode" || arg === "-m") {
      const value = input[i + 1];
      if (!value) {
        console.error('Missing value for --mode. Use "srgb" or "p3".');
        process.exit(1);
      }
      if (value !== "srgb" && value !== "p3") {
        console.error(`Invalid mode: ${value}. Use "srgb" or "p3".`);
        process.exit(1);
      }
      options.mode = value as Mode;
      i += 1;
      continue;
    }
    if (arg?.startsWith("--mode=")) {
      const value = arg.split("=")[1];
      if (!value) {
        console.error('Missing value for --mode. Use "srgb" or "p3".');
        process.exit(1);
      }
      if (value !== "srgb" && value !== "p3") {
        console.error(`Invalid mode: ${value}. Use "srgb" or "p3".`);
        process.exit(1);
      }
      options.mode = value as Mode;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    console.error(`Unknown argument: ${arg}`);
    printHelp();
    process.exit(1);
  }
  return options;
}

function resolveConfigPath(configPath?: string): string {
  if (configPath) {
    const resolved = path.resolve(process.cwd(), configPath);
    if (!existsSync(resolved)) {
      console.error(`Config not found: ${configPath}`);
      process.exit(1);
    }
    return resolved;
  }

  for (const filename of DEFAULT_CONFIG_FILES) {
    const candidate = path.resolve(process.cwd(), filename);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  console.error("No config file found. Expected one of:");
  for (const filename of DEFAULT_CONFIG_FILES) {
    console.error(`  - ${filename}`);
  }
  process.exit(1);
  throw new Error("No config file found.");
}

async function loadConfig(filePath: string): Promise<Record<string, unknown>> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".json") {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  }

  if (ext === ".cjs") {
    const require = createRequire(import.meta.url);
    return require(filePath) as Record<string, unknown>;
  }

  const module = await import(pathToFileURL(filePath).href);
  return (module.default ?? module.config ?? module.theme ?? module) as Record<string, unknown>;
}

function printHelp(): void {
  console.log(
    [
      "palette-kit generate [options]",
      "",
      "Options:",
      "  -c, --config <file>  Config file (default: palette.config.*)",
      "  -o, --out <file>     Output file (default: src/theme.ts)",
      "  -m, --mode <srgb|p3> Export mode (default: theme as-is)",
      "  -h, --help           Show help",
      "",
      "Example:",
      "  palette-kit generate --config palette.config.mjs --out src/theme.ts",
    ].join("\n"),
  );
}
