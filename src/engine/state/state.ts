export const STATES = Object.freeze([
  "default",
  "hover",
  "active",
  "focus",
  "selected",
  "disabled",
] as const);

export type State = (typeof STATES)[number];

export type StateDeltaDirection = "increase" | "decrease";

export type StateDeltaTable = Readonly<Record<State, number>>;

export const defaultStateDeltas = Object.freeze({
  default: 0,
  hover: 3,
  active: 6,
  focus: 4,
  selected: 5,
  disabled: 10,
} satisfies StateDeltaTable);

const stateList = STATES.join(", ");

const formatInvalidStateError = (value: unknown) =>
  `Invalid state "${String(value)}". Expected one of: ${stateList}.`;

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

export function isState(value: unknown): value is State {
  return typeof value === "string" && (STATES as readonly string[]).includes(value);
}

export function assertState(value: unknown): asserts value is State {
  if (!isState(value)) {
    throw new Error(formatInvalidStateError(value));
  }
}

export function applyStateDelta(
  value: number,
  state: State,
  direction: StateDeltaDirection,
): number {
  if (!Number.isFinite(value)) {
    throw new Error("State delta value must be a finite number.");
  }

  assertState(state);

  const delta = defaultStateDeltas[state];

  if (state === "default") {
    return clampPercentage(value);
  }

  if (direction === "increase") {
    return clampPercentage(value + delta);
  }

  return clampPercentage(value - delta);
}
