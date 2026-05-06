import { loadState } from "./state.js";

export function printStatus() {
  const state = loadState();
  const accepted = state.experiments.filter(e => e.status === "accepted").length;
  const rejected = state.experiments.filter(e => e.status === "rejected").length;
  const failed = state.experiments.filter(e => e.status === "failed").length;
  console.log(JSON.stringify({ bestMetric: state.bestMetric, bestExperiment: state.bestExperiment, total: state.experiments.length, accepted, rejected, failed, last: state.experiments.at(-1) ?? null }, null, 2));
}
