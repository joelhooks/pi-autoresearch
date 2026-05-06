import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { loadConfig, writeDefaultConfig } from "../config.js";
import { printStatus } from "../report.js";
import { runAutoResearch } from "../run.js";
import { loadState } from "../state.js";
import { existsSync, writeFileSync } from "node:fs";

function text(content: unknown, details: Record<string, unknown> = {}) {
  return { content: [{ type: "text" as const, text: typeof content === "string" ? content : JSON.stringify(content, null, 2) }], details };
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "autoresearch_init",
    label: "Autoresearch Init",
    description: "Initialize an autoresearch config/program in the current repo.",
    parameters: Type.Object({
      force: Type.Optional(Type.Boolean({ description: "Overwrite autoresearch.config.json and program.md if present" }))
    }),
    async execute(_id, params) {
      if (params.force || !existsSync("autoresearch.config.json")) writeDefaultConfig();
      if (params.force || !existsSync("program.md")) {
        writeFileSync("program.md", `# Autoresearch Program\n\nOptimize the configured metric. Make one coherent, testable change per iteration. Mechanical verification only. Keep the evaluation command runnable.\n`);
      }
      return text({ ok: true, files: ["autoresearch.config.json", "program.md"] });
    }
  });

  pi.registerTool({
    name: "autoresearch_run",
    label: "Autoresearch Run",
    description: "Run the autonomous propose/evaluate/accept-or-revert loop in the current repo.",
    parameters: Type.Object({
      configPath: Type.Optional(Type.String({ description: "Config path, defaults to autoresearch.config.json" }))
    }),
    async execute(_id, params) {
      await runAutoResearch(params.configPath);
      return text({ ok: true, state: loadState() });
    }
  });

  pi.registerTool({
    name: "autoresearch_status",
    label: "Autoresearch Status",
    description: "Read autoresearch state for the current repo.",
    parameters: Type.Object({}),
    async execute() {
      return text({ ok: true, config: existsSync("autoresearch.config.json") ? loadConfig() : null, state: loadState() });
    }
  });

  pi.registerCommand("autoresearch", {
    description: "Show autoresearch status. Use tools for init/run.",
    handler: async (_args, ctx) => {
      const state = loadState();
      ctx.ui.notify(`autoresearch: ${state.experiments.length} experiments, best=${state.bestMetric ?? "none"}`, "info");
    }
  });
}
