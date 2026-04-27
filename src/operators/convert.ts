import { normalizeOklch, type OklchInput } from "../core/oklch.js";

export const CONVERSION_EPSILON = 1e-10;

export type OklabColor = {
  space: "oklab";
  l: number;
  a: number;
  b: number;
  alpha: number;
};

export type LinearRgbColor = {
  space: "linear-rgb";
  r: number;
  g: number;
  b: number;
  alpha: number;
};

export type OklabInput = {
  l: number;
  a: number;
  b: number;
  alpha?: number;
};

export type LinearRgbInput = {
  r: number;
  g: number;
  b: number;
  alpha?: number;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizePrecision = (value: number) => (Math.abs(value) <= CONVERSION_EPSILON ? 0 : value);

const normalizeHue = (hue: number) => {
  const normalized = ((hue % 360) + 360) % 360;
  return normalizePrecision(normalized);
};

const validateFiniteChannel = (space: string, name: string, value: number) => {
  if (!isFiniteNumber(value)) {
    throw new Error(`${space} ${name} must be a finite number.`);
  }
};

const normalizeAlpha = (space: string, alphaInput: number | undefined) => {
  const alpha = alphaInput ?? 1;
  validateFiniteChannel(space, "alpha", alpha);
  return normalizePrecision(alpha);
};

export function oklchToOklab(input: OklchInput): OklabColor {
  const color = normalizeOklch(input);
  const hueRadians = (color.h * Math.PI) / 180;

  return {
    space: "oklab",
    l: normalizePrecision(color.l / 100),
    a: normalizePrecision(color.c * Math.cos(hueRadians)),
    b: normalizePrecision(color.c * Math.sin(hueRadians)),
    alpha: normalizePrecision(color.alpha),
  };
}

export function oklabToOklch(input: OklabInput): ReturnType<typeof normalizeOklch> {
  validateFiniteChannel("OKLab", "l", input.l);
  validateFiniteChannel("OKLab", "a", input.a);
  validateFiniteChannel("OKLab", "b", input.b);

  const alpha = normalizeAlpha("OKLab", input.alpha);
  const c = Math.hypot(input.a, input.b);
  const hue = c <= CONVERSION_EPSILON ? 0 : (Math.atan2(input.b, input.a) * 180) / Math.PI;

  return normalizeOklch({
    l: normalizePrecision(input.l * 100),
    c: normalizePrecision(c),
    h: normalizeHue(hue),
    alpha,
  });
}

export function oklabToLinearRgb(input: OklabInput): LinearRgbColor {
  validateFiniteChannel("OKLab", "l", input.l);
  validateFiniteChannel("OKLab", "a", input.a);
  validateFiniteChannel("OKLab", "b", input.b);

  const alpha = normalizeAlpha("OKLab", input.alpha);
  const lPrime = input.l + 0.3963377774 * input.a + 0.2158037573 * input.b;
  const mPrime = input.l - 0.1055613458 * input.a - 0.0638541728 * input.b;
  const sPrime = input.l - 0.0894841775 * input.a - 1.291485548 * input.b;

  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  return {
    space: "linear-rgb",
    r: normalizePrecision(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: normalizePrecision(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: normalizePrecision(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    alpha,
  };
}

export function linearRgbToOklab(input: LinearRgbInput): OklabColor {
  validateFiniteChannel("linear RGB", "r", input.r);
  validateFiniteChannel("linear RGB", "g", input.g);
  validateFiniteChannel("linear RGB", "b", input.b);

  const alpha = normalizeAlpha("linear RGB", input.alpha);
  const l = Math.cbrt(0.4122214708 * input.r + 0.5363325363 * input.g + 0.0514459929 * input.b);
  const m = Math.cbrt(0.2119034982 * input.r + 0.6806995451 * input.g + 0.1073969566 * input.b);
  const s = Math.cbrt(0.0883024619 * input.r + 0.2817188376 * input.g + 0.6299787005 * input.b);

  return {
    space: "oklab",
    l: normalizePrecision(0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s),
    a: normalizePrecision(1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s),
    b: normalizePrecision(0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s),
    alpha,
  };
}
