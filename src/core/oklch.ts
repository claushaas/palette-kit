export type OklchColor = {
	space: 'oklch';
	l: number;
	c: number;
	h: number;
	alpha: number;
};

export type OklchInput = {
	l: number;
	c: number;
	h: number;
	alpha?: number;
};

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const normalizeHue = (hue: number) => {
	const normalized = ((hue % 360) + 360) % 360;
	return Object.is(normalized, -0) ? 0 : normalized;
};

const validateFiniteChannel = (name: string, value: number) => {
	if (!isFiniteNumber(value)) {
		throw new Error(`OKLCH ${name} must be a finite number.`);
	}
};

export function normalizeOklch(input: OklchInput): OklchColor {
	validateFiniteChannel('l', input.l);
	validateFiniteChannel('c', input.c);
	validateFiniteChannel('h', input.h);

	if (input.l < 0 || input.l > 100) {
		throw new Error('OKLCH l must be between 0 and 100.');
	}

	if (input.c < 0) {
		throw new Error('OKLCH c must be greater than or equal to 0.');
	}

	const alpha = input.alpha ?? 1;
	validateFiniteChannel('alpha', alpha);

	if (alpha < 0 || alpha > 1) {
		throw new Error('OKLCH alpha must be between 0 and 1.');
	}

	return {
		alpha,
		c: input.c,
		h: normalizeHue(input.h),
		l: input.l,
		space: 'oklch',
	};
}

export function isOklchColor(value: unknown): value is OklchColor {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Partial<OklchColor>;

	return (
		candidate.space === 'oklch' &&
		isFiniteNumber(candidate.l) &&
		candidate.l >= 0 &&
		candidate.l <= 100 &&
		isFiniteNumber(candidate.c) &&
		candidate.c >= 0 &&
		isFiniteNumber(candidate.h) &&
		candidate.h >= 0 &&
		candidate.h < 360 &&
		isFiniteNumber(candidate.alpha) &&
		candidate.alpha >= 0 &&
		candidate.alpha <= 1
	);
}

export function assertOklchColor(value: unknown): asserts value is OklchColor {
	if (!isOklchColor(value)) {
		throw new Error('Expected a normalized OKLCH color.');
	}
}
