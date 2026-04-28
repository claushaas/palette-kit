import {
	createIntentRegistry,
	type IntentDefinition,
	type IntentRegistry,
} from './core/intent-registry.js';
import type { OklchColor } from './core/oklch.js';
import { assertContext, type Context } from './engine/context/context.js';
import { resolveColor } from './engine/resolve/resolve.js';
import { serializeColor } from './export/serialize.js';
import {
	assertColorOutput,
	type ColorOutput,
	type ResolveOutput,
	resolveOutput,
} from './export/types.js';
import {
	defaultResolverConfig,
	getResolverPresetConfig,
	mergeResolverConfig,
	type ResolverConfig,
} from './presets/presets.js';
import type {
	PaletteKit,
	PaletteKitConfig,
	PaletteResolveOptions,
} from './types/index.js';

function resolveSerializedOutput<O extends ColorOutput>(
	color: OklchColor,
	output: O,
): ResolveOutput<O> {
	if (output === 'oklch') {
		return color as ResolveOutput<O>;
	}

	return serializeColor(color, output) as ResolveOutput<O>;
}

function validateOptionalContext(context: Context | undefined): void {
	if (context !== undefined) {
		assertContext(context);
	}
}

function validateOptionalOutput(output: ColorOutput | undefined): void {
	if (output !== undefined) {
		assertColorOutput(output);
	}
}

function createResolveFunction<
	I extends string,
	PaletteOutput extends ColorOutput,
>(
	intentRegistry: IntentRegistry<I>,
	paletteContext: Context | undefined,
	systemDefaultContext: Context | undefined,
	paletteOutput: PaletteOutput | undefined,
	resolverConfig: ResolverConfig,
) {
	return <const ResolverOutput extends ColorOutput = PaletteOutput>(
		options: PaletteResolveOptions<I, ResolverOutput>,
	) => {
		const output = resolveOutput({
			paletteOutput,
			resolverOutput: options.output,
		}) as ResolverOutput;

		const resolved = resolveColor({
			intent: options.intent,
			intentRegistry,
			level: options.level,
			on: options.on,
			over: options.over,
			paletteContext,
			resolverConfig,
			resolverContext: options.context,
			state: options.state,
			stateDirection: options.stateDirection,
			systemDefaultContext,
			under: options.under,
			usage: options.usage,
		});

		return resolveSerializedOutput(resolved.color, output);
	};
}

/**
 * Creates an immutable Palette Kit resolver instance.
 *
 * The factory normalizes the provided intent registry once, keeps context and
 * output defaults explicit, and never reads ambient platform state.
 */
export function createPaletteKit<
	const I extends string,
	const PaletteOutput extends ColorOutput = 'oklch',
>(config: PaletteKitConfig<I, PaletteOutput>): PaletteKit<I, PaletteOutput> {
	validateOptionalContext(config.context);
	validateOptionalContext(config.systemDefaultContext);
	validateOptionalOutput(config.output);
	const presetConfig =
		config.preset === undefined
			? defaultResolverConfig
			: getResolverPresetConfig(config.preset);
	const resolverConfig = mergeResolverConfig(
		presetConfig,
		config.resolverConfig,
	);

	const intentRegistry = createIntentRegistry(
		config.intents as Record<I, IntentDefinition>,
	);

	return Object.freeze({
		resolve: createResolveFunction(
			intentRegistry,
			config.context,
			config.systemDefaultContext,
			config.output,
			resolverConfig,
		),
	}) as PaletteKit<I, PaletteOutput>;
}
