import { existsSync, writeFileSync } from "node:fs";
import { writeDefaultConfig } from "./config.js";

const PROGRAM = `# Autoresearch Program\n\nYou are running one bounded research experiment.\n\nRules:\n- Edit only the configured target files.\n- Make one coherent hypothesis per iteration.\n- Preserve the evaluation command.\n- Optimize the configured metric.\n- Prefer small, attributable changes over kitchen-sink edits.\n- Write the hypothesis and expected metric effect to .pi-autoresearch/hypothesis.md.\n`;

export function initProject() {
  writeDefaultConfig();
  if (!existsSync("program.md")) writeFileSync("program.md", PROGRAM);
  console.log("initialized autoresearch.config.json and program.md");
}
