import type { UsageStrategy } from './strategy.js';

export const fillUsageStrategy = Object.freeze({
	resolve(input) {
		return Object.freeze({
			intent: input.intent,
			usage: 'fill',
		});
	},
	usage: 'fill',
} satisfies UsageStrategy<'fill'>);
