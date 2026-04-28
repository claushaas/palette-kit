import { getIntent, type IntentName, type IntentRegistry } from "../../core/intent-registry.js";
import { normalizeOklch, type OklchColor } from "../../core/oklch.js";
import { type Context, createContextCurveHook, resolveContext } from "../context/context.js";
import { defaultLevelCurves } from "../level/curves.js";
import { assertLevel, type Level } from "../level/level.js";
import {
  applyRelation,
  type RelationOptions,
  type ResolvedRelation,
} from "../relation/relation.js";
import {
  applyStateDelta,
  assertState,
  type State,
  type StateDeltaDirection,
} from "../state/state.js";
import { assertUsage, getUsageStrategy, type Usage } from "../usage/strategy.js";

export type ResolveColorOptions = Readonly<{
  intentRegistry: IntentRegistry;
  usage: unknown;
  intent: IntentName;
  level?: unknown;
  on?: RelationOptions["on"];
  over?: RelationOptions["over"];
  under?: RelationOptions["under"];
  state?: unknown;
  stateDirection?: StateDeltaDirection;
  resolverContext?: unknown;
  paletteContext?: unknown;
  systemDefaultContext?: unknown;
}>;

export type ResolvedColorAxes = Readonly<{
  usage: Usage;
  intent: IntentName;
  context: Context;
  level?: Level;
  state: State;
  relation?: ResolvedRelation;
}>;

export type ResolvedColor = Readonly<{
  color: OklchColor;
  axes: ResolvedColorAxes;
}>;

const contextCurve = createContextCurveHook({
  light: 0,
  dark: 0,
});

function assertStateDeltaDirection(value: unknown): asserts value is StateDeltaDirection {
  if (value !== "increase" && value !== "decrease") {
    throw new Error(
      `Invalid stateDirection "${String(value)}". Expected one of: increase, decrease.`,
    );
  }
}

const resolveLevel = (usage: Usage, level: unknown): Level | undefined => {
  if (usage === "visualVocabulary") {
    if (level !== undefined) {
      throw new Error('Level is not allowed for usage "visualVocabulary".');
    }

    return undefined;
  }

  if (level === undefined) {
    throw new Error(`Level is required for usage "${usage}".`);
  }

  assertLevel(level);
  return level;
};

const resolveBaseLightness = (usage: Usage, level: Level | undefined) => {
  if (usage === "fill") {
    return defaultLevelCurves.fill(level as Level);
  }

  if (usage === "lines") {
    return defaultLevelCurves.lines(level as Level);
  }

  return 50;
};

const resolveStateDirection = (
  state: State,
  stateDirection: StateDeltaDirection | undefined,
): StateDeltaDirection => {
  if (state === "default") {
    return stateDirection ?? "increase";
  }

  if (stateDirection === undefined) {
    throw new Error('stateDirection is required when state is not "default".');
  }

  assertStateDeltaDirection(stateDirection);
  return stateDirection;
};

export function resolveColor(options: ResolveColorOptions): ResolvedColor {
  assertUsage(options.usage);

  const stateInput = options.state ?? "default";
  assertState(stateInput);

  const context = resolveContext({
    resolverContext: options.resolverContext,
    paletteContext: options.paletteContext,
    systemDefaultContext: options.systemDefaultContext,
  });

  const level = resolveLevel(options.usage, options.level);
  const intent = getIntent(options.intentRegistry, options.intent);
  const usageResult = getUsageStrategy(options.usage).resolve({ intent });
  const baseLightness = resolveBaseLightness(options.usage, level);

  const baseColor = normalizeOklch({
    l: baseLightness,
    c: usageResult.intent.chroma,
    h: usageResult.intent.hue,
    alpha: 1,
  });

  const relationResult = applyRelation({
    usage: options.usage,
    color: baseColor,
    relations: {
      on: options.on,
      over: options.over,
      under: options.under,
    },
  });

  const stateDirection = resolveStateDirection(stateInput, options.stateDirection);
  const stateLightness = applyStateDelta(relationResult.color.l, stateInput, stateDirection);
  const contextDelta = contextCurve(context);
  const color = Object.freeze(
    normalizeOklch({
      ...relationResult.color,
      l: stateLightness + contextDelta,
    }),
  );

  const axes = Object.freeze({
    usage: options.usage,
    intent: options.intent,
    context,
    ...(level === undefined ? {} : { level }),
    state: stateInput,
    ...(relationResult.relation === undefined ? {} : { relation: relationResult.relation }),
  } satisfies ResolvedColorAxes);

  return Object.freeze({
    color,
    axes,
  });
}
