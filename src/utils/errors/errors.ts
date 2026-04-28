export type PaletteKitErrorCategory =
	| 'configuration'
	| 'resolver-input'
	| 'resolution'
	| 'serialization';

export type PaletteKitErrorCode =
	| 'UNKNOWN_INTENT'
	| 'MISSING_REQUIRED_AXIS'
	| 'FORBIDDEN_AXIS_COMBINATION'
	| 'INVALID_RELATION_TARGET'
	| 'MULTIPLE_RELATIONS'
	| 'UNRESOLVED_CONTEXT'
	| 'UNSUPPORTED_OUTPUT';

export type PaletteKitErrorDetails = Readonly<Record<string, unknown>>;

export class PaletteKitError extends Error {
	readonly code: PaletteKitErrorCode;
	readonly category: PaletteKitErrorCategory;
	readonly details?: PaletteKitErrorDetails;

	constructor(
		code: PaletteKitErrorCode,
		category: PaletteKitErrorCategory,
		message: string,
		details?: PaletteKitErrorDetails,
	) {
		super(message);
		this.name = 'PaletteKitError';
		this.code = code;
		this.category = category;
		this.details =
			details === undefined ? undefined : Object.freeze({ ...details });
	}
}

export const createUnknownIntentError = (intent: string) =>
	new PaletteKitError(
		'UNKNOWN_INTENT',
		'configuration',
		`Unknown intent "${intent}". Did you forget to register it in the Intent Registry?`,
		{ intent },
	);

export const createMissingRequiredAxisError = (
	axis: string,
	usage: string,
	message?: string,
) =>
	new PaletteKitError(
		'MISSING_REQUIRED_AXIS',
		'resolver-input',
		message ?? `${axis} is required for usage "${usage}".`,
		{ axis, usage },
	);

export const createForbiddenAxisCombinationError = (
	axis: string,
	usage: string,
	message?: string,
) =>
	new PaletteKitError(
		'FORBIDDEN_AXIS_COMBINATION',
		'resolver-input',
		message ?? `${axis} is not allowed for usage "${usage}".`,
		{ axis, usage },
	);

export const createInvalidRelationTargetError = (
	relation: string,
	message?: string,
) =>
	new PaletteKitError(
		'INVALID_RELATION_TARGET',
		'resolver-input',
		message ??
			`Relation "${relation}" target must be a normalized OKLCH color.`,
		{ relation },
	);

export const createMultipleRelationsError = (relations: readonly string[]) =>
	new PaletteKitError(
		'MULTIPLE_RELATIONS',
		'resolver-input',
		`Only one relation may be provided. Received: ${relations.join(', ')}.`,
		{ relations: [...relations] },
	);

export const createUnresolvedContextError = () =>
	new PaletteKitError(
		'UNRESOLVED_CONTEXT',
		'resolver-input',
		'Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.',
	);

export const createUnsupportedOutputError = (
	output: string,
	message?: string,
) =>
	new PaletteKitError(
		'UNSUPPORTED_OUTPUT',
		'serialization',
		message ?? `Unsupported color output "${output}" in Phase 10 serializer.`,
		{ output },
	);
