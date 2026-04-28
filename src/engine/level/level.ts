export const LEVELS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9] as const);

export type Level = (typeof LEVELS)[number];

const formatInvalidLevelError = (value: unknown) =>
  `Invalid level "${String(value)}". Expected an integer from 1 to 9.`;

export function isLevel(value: unknown): value is Level {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 9;
}

export function assertLevel(value: unknown): asserts value is Level {
  if (!isLevel(value)) {
    throw new Error(formatInvalidLevelError(value));
  }
}
