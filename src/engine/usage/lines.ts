import type { UsageStrategy } from './strategy.js';

export const linesUsageStrategy = Object.freeze({
	resolve(input) {
		return Object.freeze({
			intent: input.intent,
			usage: 'lines',
		});
	},
	usage: 'lines',
} satisfies UsageStrategy<'lines'>);
