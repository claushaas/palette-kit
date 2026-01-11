export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ColorHex = `#${string}`;
export type ColorP3 = string;

export type RadixSeedName = string;

export type TemplateId = "neutral" | "warm" | "cool";

export type ColorSource =
  | { source: "seed"; value: ColorHex }
  | { source: "radix"; name: RadixSeedName };

export type ScaleDiagnostics = {
  outOfGamutCount: number;
  outOfP3GamutCount?: number;
};

export type Scale = {
  light: Record<Step, ColorHex>;
  dark: Record<Step, ColorHex>;
  p3?: {
    light: Record<Step, ColorP3>;
    dark: Record<Step, ColorP3>;
  };
  meta?: ScaleDiagnostics;
};

export type AlphaScale = {
  light: Record<Step, ColorHex>;
  dark: Record<Step, ColorHex>;
};

export type ThemeDiagnostics = {
  contrast: Record<string, number>;
  outOfGamutCount: number;
  warnings?: string[];
};

export type Theme = {
  scales: Record<string, Scale>;
  tokens: {
    light: Record<string, ColorHex>;
    dark: Record<string, ColorHex>;
  };
  alpha?: AlphaScale;
  diagnostics?: ThemeDiagnostics;
};

export type OklchColor = {
  l: number;
  c: number;
  h: number;
};
