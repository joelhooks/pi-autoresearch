import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { runAutoResearch } from "../src/run.js";
import { loadState } from "../src/state.js";

describe("run loop", () => {
  test("accepts an improving patch and records state", async () => {
    const cwd = process.cwd();
    const dir = mkdtempSync(join(tmpdir(), "pi-autoresearch-"));
    process.chdir(dir);
    try {
      execFileSync("git", ["init", "-q"]);
      execFileSync("git", ["config", "user.email", "test@example.com"]);
      execFileSync("git", ["config", "user.name", "test"]);
      writeFileSync("train.py", "print('val_bpb:          1.000000')\n");
      writeFileSync("improve.py", "from pathlib import Path\nPath('train.py').write_text(\"print('val_bpb:          0.900000')\\n\")\n");
      writeFileSync("autoresearch.config.json", JSON.stringify({
        targetFiles: ["train.py"],
        programFile: "program.md",
        commands: { setup: null, evaluate: "python3 train.py", propose: "python3 improve.py" },
        limits: { iterations: 1, commandTimeoutSeconds: 10 }
      }));
      execFileSync("git", ["add", "."]);
      execFileSync("git", ["commit", "-q", "-m", "init"]);
      await runAutoResearch("autoresearch.config.json");
      const state = loadState();
      expect(state.bestMetric).toBe(0.9);
      expect(state.experiments[0]?.status).toBe("accepted");
    } finally {
      process.chdir(cwd);
    }
  });
});
