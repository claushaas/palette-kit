import type { UsageStrategy } from './strategy.js';

export const visualVocabularyUsageStrategy = Object.freeze({
	resolve(input) {
		return Object.freeze({
			intent: input.intent,
			usage: 'visualVocabulary',
		});
	},
	usage: 'visualVocabulary',
} satisfies UsageStrategy<'visualVocabulary'>);
