#!/usr/bin/env node
import { initProject } from "./init.js";
import { printStatus } from "./report.js";
import { runAutoResearch } from "./run.js";

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === "init") initProject();
  else if (cmd === "run") await runAutoResearch(args[0]);
  else if (cmd === "status") printStatus();
  else {
    console.log(`pi-autoresearch\n\nUsage:\n  pi-autoresearch init\n  pi-autoresearch run [config.json]\n  pi-autoresearch status`);
    process.exit(cmd ? 1 : 0);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
