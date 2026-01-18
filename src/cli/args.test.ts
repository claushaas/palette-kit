import { describe, expect, it } from "vitest";

import { CliUsageError, parseArgs } from "./args.js";

describe("cli args", () => {
  it("parses init command", () => {
    const parsed = parseArgs(["init"]);
    expect(parsed.command).toBe("init");
  });

  it("parses build command with flags", () => {
    const parsed = parseArgs(["build", "--config", "custom.ts", "--outDir", "out", "--report"]);
    expect(parsed.command).toBe("build");
    expect(parsed.flags.config).toBe("custom.ts");
    expect(parsed.flags.outDir).toBe("out");
    expect(parsed.flags.report).toBe(true);
  });

  it("recognizes help and version flags", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
    expect(parseArgs(["--version"]).version).toBe(true);
  });

  it("throws on unknown arguments", () => {
    expect(() => parseArgs(["build", "wat"])).toThrow(CliUsageError);
  });
});

