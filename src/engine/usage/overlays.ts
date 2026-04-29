import type { UsageStrategy } from './strategy.js';

export const overlaysUsageStrategy = Object.freeze({
	resolve(input) {
		return Object.freeze({
			intent: input.intent,
			usage: 'overlays',
		});
	},
	usage: 'overlays',
} satisfies UsageStrategy<'overlays'>);
