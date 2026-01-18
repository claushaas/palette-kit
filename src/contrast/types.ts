export type ContrastModel = "apca" | "wcag2" | "none";

export type ContrastCheckResult = {
  model: ContrastModel;
  target: number;
  value: number;
  pass: boolean;
};

export type SolveOptions = {
  strict?: boolean;
  maxIterations?: number;
  epsilon?: number;
};

export type SrgbColor = {
  r: number;
  g: number;
  b: number;
};
