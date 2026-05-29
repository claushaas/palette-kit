import { resolveOnContrast } from '../../contrast/contrast.js';
import {
	isOklchColor,
	normalizeOklch,
	type OklchColor,
} from '../../core/oklch.js';
import type { ColorOutput, ResolveOutput } from '../../export/types.js';
import { linearRgbToOklab, oklabToOklch } from '../../operators/convert.js';
import {
	defaultResolverConfig,
	type ResolverConfig,
} from '../../presets/presets.js';
import {
	createForbiddenAxisCombinationError,
	createInvalidRelationTargetError,
	createMissingRequiredAxisError,
	createMultipleRelationsError,
} from '../../utils/errors/errors.js';
import type { Context } from '../context/context.js';
import type { Level } from '../level/level.js';
import { assertUsage, type Usage } from '../usage/strategy.js';

export const RELATIONS = Object.freeze(['on', 'over', 'under'] as const);

export type Relation = (typeof RELATIONS)[number];

export type RelationAvailability = 'required' | 'optional' | 'forbidden';

export type RelationInputTarget = ResolveOutput<ColorOutput>;

export type RelationTarget = Readonly<OklchColor>;

export type RelationOptions = Readonly<{
	on?: RelationInputTarget;
	over?: RelationInputTarget;
	under?: RelationInputTarget;
}>;

export type ResolvedRelation<R extends Relation = Relation> = Readonly<{
	relation: R;
	target: RelationTarget;
}>;

export type RelationApplicationInput = Readonly<{
	usage: Usage;
	color: RelationTarget;
	context?: Context;
	level?: Level;
	resolverConfig?: ResolverConfig;
	relations?: RelationOptions;
}>;

export type RelationApplicationResult = Readonly<{
	color: RelationTarget;
	relation?: ResolvedRelation;
}>;

export type RelationApplicationHookInput = Readonly<{
	color: RelationTarget;
	context: Context;
	relation: ResolvedRelation;
	level?: Level;
	resolverConfig: ResolverConfig;
}>;

export type RelationApplicationHook = (
	input: RelationApplicationHookInput,
) => RelationApplicationResult;

const fillRelationCompatibility = Object.freeze({
	on: 'optional',
	over: 'forbidden',
	under: 'forbidden',
} satisfies Record<Relation, RelationAvailability>);

const visualVocabularyRelationCompatibility = Object.freeze({
	on: 'required',
	over: 'forbidden',
	under: 'forbidden',
} satisfies Record<Relation, RelationAvailability>);

const linesRelationCompatibility = Object.freeze({
	on: 'optional',
	over: 'forbidden',
	under: 'forbidden',
} satisfies Record<Relation, RelationAvailability>);

const overlaysRelationCompatibility = Object.freeze({
	on: 'forbidden',
	over: 'optional',
	under: 'optional',
} satisfies Record<Relation, RelationAvailability>);

export const relationCompatibility = Object.freeze({
	fill: fillRelationCompatibility,
	lines: linesRelationCompatibility,
	overlays: overlaysRelationCompatibility,
	visualVocabulary: visualVocabularyRelationCompatibility,
} satisfies {
	readonly [U in Usage]: Readonly<Record<Relation, RelationAvailability>>;
});

const relationList = RELATIONS.join(', ');

const formatInvalidRelationError = (value: unknown) =>
	`Invalid relation "${String(value)}". Expected one of: ${relationList}.`;

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const isEncodedRgbChannel = (value: unknown): value is number =>
	typeof value === 'number' &&
	Number.isInteger(value) &&
	value >= 0 &&
	value <= 255;

const isAlphaChannel = (value: unknown): value is number =>
	isFiniteNumber(value) && value >= 0 && value <= 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const isOklabRelationTarget = (
	value: unknown,
): value is ResolveOutput<'oklab'> => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		value.space === 'oklab' &&
		isFiniteNumber(value.l) &&
		value.l >= 0 &&
		value.l <= 1 &&
		isFiniteNumber(value.a) &&
		isFiniteNumber(value.b) &&
		isAlphaChannel(value.alpha)
	);
};

const isRgbRelationTarget = (
	value: unknown,
): value is ResolveOutput<'srgb'> => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		isEncodedRgbChannel(value.r) &&
		isEncodedRgbChannel(value.g) &&
		isEncodedRgbChannel(value.b) &&
		isAlphaChannel(value.alpha)
	);
};

const isRgbaRelationTarget = (
	value: unknown,
): value is ResolveOutput<'rgba'> => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		isEncodedRgbChannel(value.r) &&
		isEncodedRgbChannel(value.g) &&
		isEncodedRgbChannel(value.b) &&
		isAlphaChannel(value.a)
	);
};

const isHexRelationTarget = (value: unknown): value is ResolveOutput<'hex'> =>
	typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value);

const parseHexChannel = (hex: string, start: number) =>
	Number.parseInt(hex.slice(start, start + 2), 16);

const decodeSrgbChannel = (channel: number) => {
	const encoded = channel / 255;

	return encoded <= 0.04045
		? encoded / 12.92
		: ((encoded + 0.055) / 1.055) ** 2.4;
};

const rgbTargetToOklch = (
	target: Readonly<{ r: number; g: number; b: number; alpha: number }>,
) =>
	oklabToOklch(
		linearRgbToOklab({
			alpha: target.alpha,
			b: decodeSrgbChannel(target.b),
			g: decodeSrgbChannel(target.g),
			r: decodeSrgbChannel(target.r),
		}),
	);

export function isRelation(value: unknown): value is Relation {
	return (
		typeof value === 'string' &&
		(RELATIONS as readonly string[]).includes(value)
	);
}

export function assertRelation(value: unknown): asserts value is Relation {
	if (!isRelation(value)) {
		throw new Error(formatInvalidRelationError(value));
	}
}

function normalizeRelationTarget(
	relation: Relation,
	target: unknown,
): RelationTarget {
	if (isOklchColor(target)) {
		return target;
	}

	if (isOklabRelationTarget(target)) {
		return oklabToOklch(target);
	}

	if (isHexRelationTarget(target)) {
		return rgbTargetToOklch({
			alpha: 1,
			b: parseHexChannel(target, 5),
			g: parseHexChannel(target, 3),
			r: parseHexChannel(target, 1),
		});
	}

	if (isRgbaRelationTarget(target)) {
		return rgbTargetToOklch({
			alpha: target.a,
			b: target.b,
			g: target.g,
			r: target.r,
		});
	}

	if (isRgbRelationTarget(target)) {
		return rgbTargetToOklch(target);
	}

	throw createInvalidRelationTargetError(relation);
}

const getProvidedRelations = (relations: RelationOptions) =>
	RELATIONS.filter((relation) => relations[relation] !== undefined);

export function validateRelationOptions(
	usage: Usage,
	relations: RelationOptions = {},
): ResolvedRelation | undefined {
	assertUsage(usage);

	const providedRelations = getProvidedRelations(relations);

	if (providedRelations.length > 1) {
		throw createMultipleRelationsError(providedRelations);
	}

	const requiredRelation = RELATIONS.find(
		(relation) => relationCompatibility[usage][relation] === 'required',
	);

	if (providedRelations.length === 0) {
		if (requiredRelation !== undefined) {
			throw createMissingRequiredAxisError(
				`Relation "${requiredRelation}"`,
				usage,
			);
		}

		return undefined;
	}

	const relation = providedRelations[0];
	if (relation === undefined) {
		return undefined;
	}

	const availability = relationCompatibility[usage][relation];

	if (availability === 'forbidden') {
		throw createForbiddenAxisCombinationError(`Relation "${relation}"`, usage);
	}

	const target = relations[relation];
	const normalizedTarget = normalizeRelationTarget(relation, target);

	return Object.freeze({
		relation,
		target: normalizedTarget,
	});
}

export const relationApplicationHooks = Object.freeze({
	on(input) {
		return Object.freeze({
			color: resolveOnContrast({
				color: input.color,
				config: {
					chromaLimits: input.resolverConfig.chromaLimits,
					on: input.resolverConfig.relationParams.on,
				},
				context: input.context,
				target: input.relation.target,
			}),
			relation: input.relation,
		});
	},
	over(input) {
		const alpha =
			input.level === undefined
				? input.color.alpha
				: input.resolverConfig.relationParams.over.baseAlphaByLevel[
						input.level
					];

		return Object.freeze({
			color: normalizeOklch({
				...input.color,
				alpha,
			}),
			relation: input.relation,
		});
	},
	under(input) {
		const alpha =
			input.level === undefined
				? input.color.alpha
				: input.resolverConfig.relationParams.under.baseAlphaByLevel[
						input.level
					];
		const luminanceReduction =
			input.resolverConfig.relationParams.under.luminanceReduction;

		return Object.freeze({
			color: normalizeOklch({
				...input.color,
				alpha,
				l: Math.max(0, input.color.l - luminanceReduction),
			}),
			relation: input.relation,
		});
	},
} satisfies Record<Relation, RelationApplicationHook>);

export function applyRelation(
	input: RelationApplicationInput,
): RelationApplicationResult {
	if (!isOklchColor(input.color)) {
		throw createInvalidRelationTargetError(
			'input',
			'Relation input color must be a normalized OKLCH color.',
		);
	}

	const relation = validateRelationOptions(input.usage, input.relations);

	if (relation === undefined) {
		return Object.freeze({
			color: input.color,
		});
	}

	return relationApplicationHooks[relation.relation]({
		color: input.color,
		context: input.context ?? 'light',
		level: input.level,
		relation,
		resolverConfig: input.resolverConfig ?? defaultResolverConfig,
	});
}
