import type { IntentDefinition as InternalIntentDefinition } from '../core/intent-registry.js';
import type { OklchColor as InternalOklchColor } from '../core/oklch.js';
import type { Context as InternalContext } from '../engine/context/context.js';
import type { Level as InternalLevel } from '../engine/level/level.js';
import type {
	State as InternalState,
	StateDeltaDirection,
} from '../engine/state/state.js';
import type { Usage as InternalUsage } from '../engine/usage/strategy.js';
import type {
	ColorOutput as InternalColorOutput,
	RgbaColor as InternalRgbaColor,
	RgbColor as InternalRgbColor,
	ResolveOutput,
} from '../export/types.js';

/** Semantic usage axis used by the resolver. */
export type Usage = InternalUsage;

/** Explicit level axis. Valid values are integers from 1 to 9. */
export type Level = InternalLevel;

/** Interactive state axis. State deltas are applied only when explicitly requested. */
export type State = InternalState;

/** Direction used when applying non-default state deltas. Palette Kit never infers it. */
export type { StateDeltaDirection };

/** Environmental context axis. Palette Kit never detects this automatically. */
export type Context = InternalContext;

/** Output format applied after OKLCH resolution. */
export type ColorOutput = InternalColorOutput;

/** Normalized internal OKLCH color returned by the default public output. */
export type OklchColor = InternalOklchColor;

/** RGBA object returned by `output: "rgba"`. */
export type RgbaColor = InternalRgbaColor;

/** RGB object returned by `output: "srgb"` and `output: "p3"`. */
export type RgbColor = InternalRgbColor;

/** Intent registry entry supplied at palette creation. */
export type IntentDefinition = InternalIntentDefinition;

/** Public return type for a selected resolver output format. */
export type PaletteResolveOutput<O extends ColorOutput = 'oklch'> =
	ResolveOutput<O>;

/** Configuration for `createPaletteKit`. */
export type PaletteKitConfig<
	I extends string = string,
	PaletteOutput extends ColorOutput = 'oklch',
> = Readonly<{
	/** Flat intent registry owned by the application. */
	intents: Record<I, IntentDefinition>;

	/** Palette-level context used when a resolver call does not override it. */
	context?: Context;

	/** Host-provided context fallback. Palette Kit never reads system preferences. */
	systemDefaultContext?: Context;

	/** Palette-level output used when a resolver call does not override it. */
	output?: PaletteOutput;
}>;

/** Options accepted by `palette.resolve`. */
export type PaletteResolveOptions<
	I extends string = string,
	ResolverOutput extends ColorOutput = ColorOutput,
> = Readonly<{
	/** Resolver usage axis. */
	usage: Usage;

	/** Registered semantic intent name. */
	intent: I;

	/** Required for fill, lines, and overlays; forbidden for visualVocabulary. */
	level?: Level;

	/** Relation target for text, icons, and other on-surface vocabulary. */
	on?: OklchColor;

	/** Relation target for overlay-like colors. */
	over?: OklchColor;

	/** Relation target for underlay-like colors. */
	under?: OklchColor;

	/** Optional interaction state. Defaults to `default`. */
	state?: State;

	/** Required when `state` is not `default`; never inferred. */
	stateDirection?: StateDeltaDirection;

	/** Resolver-level context override. */
	context?: Context;

	/** Resolver-level output override. */
	output?: ResolverOutput;
}>;

/** Immutable public Palette Kit instance. */
export type PaletteKit<
	I extends string = string,
	PaletteOutput extends ColorOutput = 'oklch',
> = Readonly<{
	/** Resolves a color from semantic axes and formats it after OKLCH resolution. */
	resolve<const ResolverOutput extends ColorOutput = PaletteOutput>(
		options: PaletteResolveOptions<I, ResolverOutput>,
	): PaletteResolveOutput<ResolverOutput>;
}>;
