import { writeFileSync } from "node:fs";
import { loadConfig } from "./config.js";
import { add, checkout, commit, currentCommit, diff, hasChanges } from "./git.js";
import { isAccepted, parseMetric, improvement } from "./metric.js";
import { runShell } from "./shell.js";
import { LOG_DIR, PATCH_DIR, appendExperiment, ensureStateDirs, loadState, saveState } from "./state.js";
import type { AutoResearchConfig, ExperimentRecord } from "./types.js";

async function evaluate(cfg: AutoResearchConfig) {
  const result = await runShell(cfg.commands.evaluate, cfg.limits.commandTimeoutSeconds);
  const output = `${result.stdout}\n${result.stderr}`;
  return { result, metric: parseMetric(output, cfg), output };
}

export async function runAutoResearch(configPath?: string) {
  const cfg = loadConfig(configPath);
  ensureStateDirs();
  const state = loadState();
  let bestMetric = state.bestMetric;

  if (cfg.commands.setup && state.experiments.length === 0) {
    console.log(`[setup] ${cfg.commands.setup}`);
    const setup = await runShell(cfg.commands.setup, cfg.limits.commandTimeoutSeconds);
    if (setup.code !== 0) throw new Error(`setup failed with code ${setup.code}`);
  }

  if (bestMetric == null) {
    console.log(`[baseline] ${cfg.commands.evaluate}`);
    const base = await evaluate(cfg);
    if (base.metric == null) throw new Error(`baseline metric ${cfg.metric.name} not found`);
    bestMetric = base.metric;
    const logPath = `${LOG_DIR}/baseline.log`;
    writeFileSync(logPath, base.output);
    const baselineState = loadState();
    baselineState.bestMetric = bestMetric;
    baselineState.bestExperiment = 0;
    saveState(baselineState);
    console.log(`[baseline] ${cfg.metric.name}=${bestMetric}`);
  }

  for (let i = 0; i < cfg.limits.iterations; i++) {
    const id = loadState().experiments.length + 1;
    const startedAt = new Date().toISOString();
    const commitBefore = currentCommit();
    const logPath = `${LOG_DIR}/experiment-${id}.log`;
    const patchPath = `${PATCH_DIR}/experiment-${id}.patch`;
    console.log(`[experiment ${id}] proposing`);

    let record: ExperimentRecord;
    try {
      const proposal = await runShell(cfg.commands.propose, cfg.limits.commandTimeoutSeconds);
      if (proposal.code !== 0) throw new Error(`proposal failed with code ${proposal.code}`);
      if (!hasChanges(cfg.targetFiles)) throw new Error(`proposal made no changes to target files: ${cfg.targetFiles.join(", ")}`);
      writeFileSync(patchPath, diff());

      console.log(`[experiment ${id}] evaluating`);
      const ev = await evaluate(cfg);
      writeFileSync(logPath, ev.output);
      if (ev.result.code !== 0) throw new Error(`evaluation failed with code ${ev.result.code}`);
      if (ev.metric == null) throw new Error(`metric ${cfg.metric.name} not found`);

      const accepted = isAccepted(ev.metric, bestMetric, cfg);
      const delta = bestMetric == null ? null : improvement(ev.metric, bestMetric, cfg.metric.direction);
      if (accepted) {
        add(cfg.targetFiles);
        const commitAfter = commit(`Accept autoresearch experiment ${id}: improve ${cfg.metric.name} to ${ev.metric}`);
        bestMetric = ev.metric;
        record = { id, startedAt, endedAt: new Date().toISOString(), status: "accepted", baselineMetric: state.bestMetric, metric: ev.metric, improvement: delta, commitBefore, commitAfter, patchPath, logPath };
        console.log(`[experiment ${id}] accepted ${cfg.metric.name}=${ev.metric} delta=${delta}`);
      } else {
        checkout(cfg.targetFiles);
        record = { id, startedAt, endedAt: new Date().toISOString(), status: "rejected", baselineMetric: bestMetric, metric: ev.metric, improvement: delta, commitBefore, commitAfter: null, patchPath, logPath };
        console.log(`[experiment ${id}] rejected ${cfg.metric.name}=${ev.metric} delta=${delta}`);
      }
    } catch (error) {
      checkout(cfg.targetFiles);
      record = { id, startedAt, endedAt: new Date().toISOString(), status: "failed", baselineMetric: bestMetric, metric: null, improvement: null, commitBefore, commitAfter: null, patchPath: null, logPath, error: error instanceof Error ? error.message : String(error) };
      console.error(`[experiment ${id}] failed: ${record.error}`);
    }
    appendExperiment(record);
  }
}
