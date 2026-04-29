import type { IntentDefinition } from '../../core/intent-registry.js';
import { fillUsageStrategy } from './fill.js';
import { linesUsageStrategy } from './lines.js';
import { overlaysUsageStrategy } from './overlays.js';
import { visualVocabularyUsageStrategy } from './visualVocabulary.js';

export const USAGES = Object.freeze([
	'fill',
	'visualVocabulary',
	'lines',
	'overlays',
] as const);

export type Usage = (typeof USAGES)[number];

export type UsageStrategyInput = Readonly<{
	intent: Readonly<IntentDefinition>;
}>;

export type UsageStrategyResult<U extends Usage = Usage> = Readonly<{
	usage: U;
	intent: Readonly<IntentDefinition>;
}>;

export type UsageStrategy<U extends Usage = Usage> = Readonly<{
	usage: U;
	resolve(input: UsageStrategyInput): UsageStrategyResult<U>;
}>;

const usageList = USAGES.join(', ');

const formatUnknownUsageError = (value: unknown) =>
	`Unknown usage "${String(value)}". Expected one of: ${usageList}.`;

export function isUsage(value: unknown): value is Usage {
	return (
		typeof value === 'string' && (USAGES as readonly string[]).includes(value)
	);
}

export function assertUsage(value: unknown): asserts value is Usage {
	if (!isUsage(value)) {
		throw new Error(formatUnknownUsageError(value));
	}
}

export const usageStrategies = Object.freeze({
	fill: fillUsageStrategy,
	lines: linesUsageStrategy,
	overlays: overlaysUsageStrategy,
	visualVocabulary: visualVocabularyUsageStrategy,
} satisfies { readonly [U in Usage]: UsageStrategy<U> });

export function getUsageStrategy<U extends Usage>(usage: U): UsageStrategy<U>;
export function getUsageStrategy(usage: unknown): UsageStrategy;
export function getUsageStrategy(usage: unknown): UsageStrategy {
	assertUsage(usage);
	return usageStrategies[usage];
}
