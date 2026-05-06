import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { AutoResearchConfig } from "./types.js";

export const DEFAULT_CONFIG: AutoResearchConfig = {
  targetFiles: ["train.py"],
  programFile: "program.md",
  metric: { name: "val_bpb", direction: "min", regex: "val_bpb:\\s*([0-9]+(?:\\.[0-9]+)?)" },
  commands: {
    setup: "uv run prepare.py",
    evaluate: "uv run train.py",
    propose: "pi -p --no-session --no-extensions \"Read program.md. Propose and implement exactly one research experiment by editing only the configured target files. Keep the evaluation command runnable. Do not run the evaluation. Summarize the hypothesis in .pi-autoresearch/hypothesis.md.\""
  },
  limits: { iterations: 12, commandTimeoutSeconds: 900 },
  acceptance: { minDelta: 0, allowEqual: false }
};

export function loadConfig(path = "autoresearch.config.json"): AutoResearchConfig {
  if (!existsSync(path)) return DEFAULT_CONFIG;
  const user = JSON.parse(readFileSync(path, "utf8"));
  return {
    ...DEFAULT_CONFIG,
    ...user,
    metric: { ...DEFAULT_CONFIG.metric, ...user.metric },
    commands: { ...DEFAULT_CONFIG.commands, ...user.commands },
    limits: { ...DEFAULT_CONFIG.limits, ...user.limits },
    acceptance: { ...DEFAULT_CONFIG.acceptance, ...user.acceptance }
  };
}

export function writeDefaultConfig(path = "autoresearch.config.json") {
  if (existsSync(path)) throw new Error(`${path} already exists`);
  writeFileSync(path, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`);
}
