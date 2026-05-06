import type { AutoResearchConfig } from "./types.js";

export function parseMetric(output: string, cfg: AutoResearchConfig): number | null {
  const re = new RegExp(cfg.metric.regex, "m");
  const match = output.match(re);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function improvement(candidate: number, baseline: number, direction: "min" | "max") {
  return direction === "min" ? baseline - candidate : candidate - baseline;
}

export function isAccepted(candidate: number, baseline: number | null, cfg: AutoResearchConfig) {
  if (baseline == null) return true;
  const delta = improvement(candidate, baseline, cfg.metric.direction);
  const minDelta = cfg.acceptance?.minDelta ?? 0;
  return cfg.acceptance?.allowEqual ? delta >= minDelta : delta > minDelta;
}
