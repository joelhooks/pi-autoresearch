import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ExperimentRecord, RunState } from "./types.js";

export const STATE_DIR = ".pi-autoresearch";
export const STATE_FILE = `${STATE_DIR}/state.json`;
export const LOG_DIR = `${STATE_DIR}/logs`;
export const PATCH_DIR = `${STATE_DIR}/patches`;

export function ensureStateDirs() { mkdirSync(LOG_DIR, { recursive: true }); mkdirSync(PATCH_DIR, { recursive: true }); }
export function loadState(): RunState {
  ensureStateDirs();
  if (!existsSync(STATE_FILE)) return { bestMetric: null, bestExperiment: null, experiments: [] };
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}
export function saveState(state: RunState) { ensureStateDirs(); writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`); }
export function appendExperiment(record: ExperimentRecord) { const state = loadState(); state.experiments.push(record); if (record.status === "accepted" && record.metric != null) { state.bestMetric = record.metric; state.bestExperiment = record.id; } saveState(state); }
