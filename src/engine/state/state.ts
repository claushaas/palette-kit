export const STATES = Object.freeze([
	'default',
	'hover',
	'active',
	'focus',
	'selected',
	'disabled',
] as const);

export type State = (typeof STATES)[number];

export type StateDeltaDirection = 'increase' | 'decrease';

export type StateDeltaTable = Readonly<Record<State, number>>;

export type StateDeltaConfig = Readonly<{
	luminance: StateDeltaTable;
	alpha: StateDeltaTable;
}>;

export const defaultStateLuminanceDeltas = Object.freeze({
	active: 6,
	default: 0,
	disabled: 10,
	focus: 4,
	hover: 3,
	selected: 5,
} satisfies StateDeltaTable);

export const defaultStateAlphaDeltas = Object.freeze({
	active: 0,
	default: 0,
	disabled: 0,
	focus: 0,
	hover: 0,
	selected: 0,
} satisfies StateDeltaTable);

export const defaultStateDeltas = Object.freeze({
	alpha: defaultStateAlphaDeltas,
	luminance: defaultStateLuminanceDeltas,
} satisfies StateDeltaConfig);

const stateList = STATES.join(', ');

const formatInvalidStateError = (value: unknown) =>
	`Invalid state "${String(value)}". Expected one of: ${stateList}.`;

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));
const clampAlpha = (value: number) =>
	Number(Math.min(1, Math.max(0, value)).toFixed(12));

export function isState(value: unknown): value is State {
	return (
		typeof value === 'string' && (STATES as readonly string[]).includes(value)
	);
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
	deltas: StateDeltaTable = defaultStateDeltas.luminance,
): number {
	if (!Number.isFinite(value)) {
		throw new Error('State delta value must be a finite number.');
	}

	assertState(state);

	const delta = deltas[state];

	if (state === 'default') {
		return clampPercentage(value);
	}

	if (direction === 'increase') {
		return clampPercentage(value + delta);
	}

	return clampPercentage(value - delta);
}

export function applyStateAlphaDelta(
	value: number,
	state: State,
	direction: StateDeltaDirection,
	deltas: StateDeltaTable = defaultStateDeltas.alpha,
): number {
	if (!Number.isFinite(value)) {
		throw new Error('State alpha delta value must be a finite number.');
	}

	assertState(state);

	const delta = deltas[state];

	if (state === 'default') {
		return clampAlpha(value);
	}

	if (direction === 'increase') {
		return clampAlpha(value + delta);
	}

	return clampAlpha(value - delta);
}
