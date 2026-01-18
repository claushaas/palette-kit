export class CliUsageError extends Error {
  override name = "CliUsageError";
}

export const HELP_TEXT = `palette-kit <command>

Commands:
  palette-kit init [--force] [--path <dir>]
  palette-kit build [--config <path>] [--outDir <dir>] [--report]

Options:
  -h, --help       Show help
  -v, --version    Show version
`;

export type ParsedArgs = {
  command?: string;
  help: boolean;
  version: boolean;
  flags: Record<string, string | boolean>;
};

export const COMMANDS = ["init", "build"] as const;

export const parseArgs = (argv: string[]): ParsedArgs => {
  const first = argv[0];
  const command = first && !first.startsWith("-") ? first : undefined;
  const rest = command ? argv.slice(1) : argv;
  const flags: Record<string, string | boolean> = {};

  let i = 0;
  while (i < rest.length) {
    const value = rest[i];
    if (value === undefined) break;
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
    throw new CliUsageError(`Unknown argument: ${value}`);
  }

  return {
    command,
    help: Boolean(flags.help),
    version: Boolean(flags.version),
    flags,
  };
};
