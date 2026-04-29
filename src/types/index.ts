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
import type {
	ChromaConfig,
	RelationParamsConfig,
	ResolverConfig,
	ResolverConfigOverrides,
	ResolverPresetName,
} from '../presets/presets.js';

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

export type {
	ChromaConfig,
	RelationParamsConfig,
	ResolverConfig,
	ResolverConfigOverrides,
	ResolverPresetName,
};

/** Public return type for a selected resolver output format. */
export type PaletteResolveOutput<O extends ColorOutput = 'oklch'> =
	ResolveOutput<O>;

/** Configuration for `createPaletteKit`. */
export type PaletteKitConfig<
	I extends string = string,
	PaletteOutput extends ColorOutput | undefined = undefined,
	SystemDefaultOutput extends ColorOutput | undefined = undefined,
> = Readonly<{
	/** Flat intent registry owned by the application. */
	intents: Record<I, IntentDefinition>;

	/** Palette-level context used when a resolver call does not override it. */
	context?: Context;

	/** Host-provided context fallback. Palette Kit never reads system preferences. */
	systemDefaultContext?: Context;

	/** Palette-level output used when a resolver call does not override it. */
	output?: PaletteOutput;

	/** Host-provided output fallback. Defaults to `oklch` when omitted. */
	systemDefaultOutput?: SystemDefaultOutput;

	/** Public resolver preset. Defaults to `neutral`. */
	preset?: ResolverPresetName;

	/** Explicit resolver configuration overrides merged on top of the preset. */
	resolverConfig?: ResolverConfigOverrides;
}>;

export type PaletteDefaultOutput<
	PaletteOutput extends ColorOutput | undefined,
	SystemDefaultOutput extends ColorOutput | undefined,
> = PaletteOutput extends ColorOutput
	? PaletteOutput
	: SystemDefaultOutput extends ColorOutput
		? SystemDefaultOutput
		: 'oklch';

type RelationTarget = OklchColor;

type DefaultStateOptions = Readonly<{
	state?: 'default';
	stateDirection?: StateDeltaDirection;
}>;

type NonDefaultStateOptions = Readonly<{
	state: Exclude<State, 'default'>;
	stateDirection: StateDeltaDirection;
}>;

type StateOptions = DefaultStateOptions | NonDefaultStateOptions;

type BaseResolveOptions<
	I extends string,
	ResolverOutput extends ColorOutput,
> = Readonly<{
	/** Registered semantic intent name. */
	intent: I;

	/** Resolver-level context override. */
	context?: Context;

	/** Resolver-level output override. */
	output?: ResolverOutput;
}>;

type FillResolveOptions = Readonly<{
	usage: 'fill';
	level: Level;
	on?: RelationTarget;
	over?: never;
	under?: never;
}>;

type LinesResolveOptions = Readonly<{
	usage: 'lines';
	level: Level;
	on?: RelationTarget;
	over?: never;
	under?: never;
}>;

type VisualVocabularyResolveOptions = Readonly<{
	usage: 'visualVocabulary';
	on: RelationTarget;
	level?: never;
	over?: never;
	under?: never;
}>;

type OverlayRelationOptions =
	| Readonly<{ over?: RelationTarget; under?: never }>
	| Readonly<{ under?: RelationTarget; over?: never }>
	| Readonly<{ over?: undefined; under?: undefined }>;

type OverlaysResolveOptions = Readonly<{
	usage: 'overlays';
	level: Level;
	on?: never;
}> &
	OverlayRelationOptions;

type UsageResolveOptions =
	| FillResolveOptions
	| LinesResolveOptions
	| VisualVocabularyResolveOptions
	| OverlaysResolveOptions;

/** Options accepted by `palette.resolve`. */
export type PaletteResolveOptions<
	I extends string = string,
	ResolverOutput extends ColorOutput = ColorOutput,
> = BaseResolveOptions<I, ResolverOutput> & UsageResolveOptions & StateOptions;

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
