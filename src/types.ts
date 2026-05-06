export type MetricDirection = "min" | "max";

export interface AutoResearchConfig {
  targetFiles: string[];
  programFile: string;
  metric: {
    name: string;
    direction: MetricDirection;
    regex: string;
  };
  commands: {
    setup?: string;
    evaluate: string;
    propose: string;
  };
  limits: {
    iterations: number;
    commandTimeoutSeconds: number;
  };
  acceptance?: {
    minDelta?: number;
    allowEqual?: boolean;
  };
}

export interface ExperimentRecord {
  id: number;
  startedAt: string;
  endedAt: string;
  status: "accepted" | "rejected" | "failed";
  baselineMetric: number | null;
  metric: number | null;
  improvement: number | null;
  commitBefore: string;
  commitAfter: string | null;
  patchPath: string | null;
  logPath: string;
  error?: string;
}

export interface RunState {
  bestMetric: number | null;
  bestExperiment: number | null;
  experiments: ExperimentRecord[];
}
