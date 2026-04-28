import { createUnresolvedContextError } from "../../utils/errors/errors.js";

export const CONTEXTS = Object.freeze(["light", "dark"] as const);

export type Context = (typeof CONTEXTS)[number];

export type ContextResolutionInput = Readonly<{
  resolverContext?: unknown;
  paletteContext?: unknown;
  systemDefaultContext?: unknown;
}>;

export type ContextCurveValues<T> = Readonly<Record<Context, T>>;

export type ContextCurveHook<T> = (context: Context) => T;

const contextList = CONTEXTS.join(", ");

const formatInvalidContextError = (value: unknown) =>
  `Invalid context "${String(value)}". Expected one of: ${contextList}.`;

export function isContext(value: unknown): value is Context {
  return typeof value === "string" && (CONTEXTS as readonly string[]).includes(value);
}

export function assertContext(value: unknown): asserts value is Context {
  if (!isContext(value)) {
    throw new Error(formatInvalidContextError(value));
  }
}

export function resolveContext({
  resolverContext,
  paletteContext,
  systemDefaultContext,
}: ContextResolutionInput): Context {
  if (resolverContext !== undefined) {
    assertContext(resolverContext);
    return resolverContext;
  }

  if (paletteContext !== undefined) {
    assertContext(paletteContext);
    return paletteContext;
  }

  if (systemDefaultContext !== undefined) {
    assertContext(systemDefaultContext);
    return systemDefaultContext;
  }

  throw createUnresolvedContextError();
}

export function createContextCurveHook<T>(values: ContextCurveValues<T>): ContextCurveHook<T> {
  const frozenValues = Object.freeze({
    light: values.light,
    dark: values.dark,
  } satisfies ContextCurveValues<T>);

  return Object.freeze((context: Context) => {
    assertContext(context);
    return frozenValues[context];
  });
}
