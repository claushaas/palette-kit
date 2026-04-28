import { isOklchColor, type OklchColor } from "../../core/oklch.js";
import { assertUsage, type Usage } from "../usage/strategy.js";

export const RELATIONS = Object.freeze(["on", "over", "under"] as const);

export type Relation = (typeof RELATIONS)[number];

export type RelationAvailability = "required" | "optional" | "forbidden";

export type RelationTarget = Readonly<OklchColor>;

export type RelationOptions = Readonly<{
  on?: RelationTarget;
  over?: RelationTarget;
  under?: RelationTarget;
}>;

export type ResolvedRelation<R extends Relation = Relation> = Readonly<{
  relation: R;
  target: RelationTarget;
}>;

export type RelationApplicationInput = Readonly<{
  usage: Usage;
  color: RelationTarget;
  relations?: RelationOptions;
}>;

export type RelationApplicationResult = Readonly<{
  color: RelationTarget;
  relation?: ResolvedRelation;
}>;

export type RelationApplicationHookInput = Readonly<{
  color: RelationTarget;
  relation: ResolvedRelation;
}>;

export type RelationApplicationHook = (
  input: RelationApplicationHookInput,
) => RelationApplicationResult;

const fillRelationCompatibility = Object.freeze({
  on: "optional",
  over: "forbidden",
  under: "forbidden",
} satisfies Record<Relation, RelationAvailability>);

const visualVocabularyRelationCompatibility = Object.freeze({
  on: "required",
  over: "forbidden",
  under: "forbidden",
} satisfies Record<Relation, RelationAvailability>);

const linesRelationCompatibility = Object.freeze({
  on: "optional",
  over: "forbidden",
  under: "forbidden",
} satisfies Record<Relation, RelationAvailability>);

const overlaysRelationCompatibility = Object.freeze({
  on: "forbidden",
  over: "optional",
  under: "optional",
} satisfies Record<Relation, RelationAvailability>);

export const relationCompatibility = Object.freeze({
  fill: fillRelationCompatibility,
  visualVocabulary: visualVocabularyRelationCompatibility,
  lines: linesRelationCompatibility,
  overlays: overlaysRelationCompatibility,
} satisfies { readonly [U in Usage]: Readonly<Record<Relation, RelationAvailability>> });

const relationList = RELATIONS.join(", ");

const formatInvalidRelationError = (value: unknown) =>
  `Invalid relation "${String(value)}". Expected one of: ${relationList}.`;

export function isRelation(value: unknown): value is Relation {
  return typeof value === "string" && (RELATIONS as readonly string[]).includes(value);
}

export function assertRelation(value: unknown): asserts value is Relation {
  if (!isRelation(value)) {
    throw new Error(formatInvalidRelationError(value));
  }
}

function assertRelationTarget(
  relation: Relation,
  target: unknown,
): asserts target is RelationTarget {
  if (!isOklchColor(target)) {
    throw new Error(`Relation "${relation}" target must be a normalized OKLCH color.`);
  }
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
    throw new Error(
      `Only one relation may be provided. Received: ${providedRelations.join(", ")}.`,
    );
  }

  const requiredRelation = RELATIONS.find(
    (relation) => relationCompatibility[usage][relation] === "required",
  );

  if (providedRelations.length === 0) {
    if (requiredRelation !== undefined) {
      throw new Error(`Relation "${requiredRelation}" is required for usage "${usage}".`);
    }

    return undefined;
  }

  const relation = providedRelations[0];
  if (relation === undefined) {
    return undefined;
  }

  const availability = relationCompatibility[usage][relation];

  if (availability === "forbidden") {
    throw new Error(`Relation "${relation}" is not allowed for usage "${usage}".`);
  }

  const target = relations[relation];
  assertRelationTarget(relation, target);

  return Object.freeze({
    relation,
    target,
  });
}

export const relationApplicationHooks = Object.freeze({
  on(input) {
    return Object.freeze({
      color: input.color,
      relation: input.relation,
    });
  },
  over(input) {
    return Object.freeze({
      color: input.color,
      relation: input.relation,
    });
  },
  under(input) {
    return Object.freeze({
      color: input.color,
      relation: input.relation,
    });
  },
} satisfies Record<Relation, RelationApplicationHook>);

export function applyRelation(input: RelationApplicationInput): RelationApplicationResult {
  if (!isOklchColor(input.color)) {
    throw new Error("Relation input color must be a normalized OKLCH color.");
  }

  const relation = validateRelationOptions(input.usage, input.relations);

  if (relation === undefined) {
    return Object.freeze({
      color: input.color,
    });
  }

  return relationApplicationHooks[relation.relation]({
    color: input.color,
    relation,
  });
}
