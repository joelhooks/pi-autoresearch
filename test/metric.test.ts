import { describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config.js";
import { improvement, isAccepted, parseMetric } from "../src/metric.js";

describe("metrics", () => {
  test("parses karpathy autoresearch val_bpb", () => {
    expect(parseMetric("---\nval_bpb:          1.234567\n", DEFAULT_CONFIG)).toBe(1.234567);
  });
  test("min direction improvement", () => {
    expect(improvement(1.1, 1.2, "min")).toBeCloseTo(0.1);
    expect(isAccepted(1.1, 1.2, DEFAULT_CONFIG)).toBe(true);
    expect(isAccepted(1.3, 1.2, DEFAULT_CONFIG)).toBe(false);
  });
});
