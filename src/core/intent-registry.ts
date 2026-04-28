import { createUnknownIntentError } from '../utils/errors/errors.js';

export type IntentName = string;

export type IntentDefinition = {
	hue: number;
	chroma: number;
};

export type IntentRegistry<I extends string = string> = Readonly<{
	intents: Readonly<Record<I, Readonly<IntentDefinition>>>;
}>;

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const normalizeHue = (hue: number) => {
	const normalized = ((hue % 360) + 360) % 360;
	return Object.is(normalized, -0) ? 0 : normalized;
};

const validateIntentName = (name: string) => {
	if (name.length === 0) {
		throw new Error('Intent name must not be empty.');
	}

	if (/\s/.test(name)) {
		throw new Error(`Intent name "${name}" must not contain whitespace.`);
	}

	if (name.includes('.')) {
		throw new Error(`Intent name "${name}" must use a flat namespace.`);
	}
};

const normalizeIntentDefinition = (
	name: string,
	definition: IntentDefinition,
): Readonly<IntentDefinition> => {
	if (!isFiniteNumber(definition.hue)) {
		throw new Error(`Intent "${name}" hue must be a finite number.`);
	}

	if (!isFiniteNumber(definition.chroma)) {
		throw new Error(`Intent "${name}" chroma must be a finite number.`);
	}

	if (definition.chroma < 0) {
		throw new Error(
			`Intent "${name}" chroma must be greater than or equal to 0.`,
		);
	}

	return Object.freeze({
		chroma: definition.chroma,
		hue: normalizeHue(definition.hue),
	});
};

export function createIntentRegistry<const I extends string>(
	intents: Record<I, IntentDefinition>,
): IntentRegistry<I> {
	const entries = Object.entries(intents) as Array<[I, IntentDefinition]>;
	const normalized = {} as Record<I, Readonly<IntentDefinition>>;

	for (const [name, definition] of entries) {
		validateIntentName(name);
		normalized[name] = normalizeIntentDefinition(name, definition);
	}

	return Object.freeze({
		intents: Object.freeze(normalized),
	});
}

export function hasIntent<I extends string>(
	registry: IntentRegistry<I>,
	intent: IntentName,
): intent is I {
	return Object.hasOwn(registry.intents, intent);
}

export function getIntent<I extends string>(
	registry: IntentRegistry<I>,
	intent: IntentName,
): Readonly<IntentDefinition> {
	if (!hasIntent(registry, intent)) {
		throw createUnknownIntentError(intent);
	}

	return registry.intents[intent];
}
