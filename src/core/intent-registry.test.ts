import { describe, expect, it } from 'vitest';

import { PaletteKitError } from '../utils/errors/errors.js';
import {
	createIntentRegistry,
	getIntent,
	hasIntent,
} from './intent-registry.js';

describe('createIntentRegistry', () => {
	it('creates a registry with valid intents', () => {
		const registry = createIntentRegistry({
			brand: { chroma: 0.14, hue: 260 },
			neutral: { chroma: 0, hue: 0 },
		});

		expect(registry.intents.neutral).toEqual({ chroma: 0, hue: 0 });
		expect(registry.intents.brand).toEqual({ chroma: 0.14, hue: 260 });
	});

	it('normalizes intent hue', () => {
		const registry = createIntentRegistry({
			fullTurn: { chroma: 0.1, hue: 360 },
			negative: { chroma: 0.1, hue: -30 },
			overflow: { chroma: 0.1, hue: 390 },
		});

		expect(registry.intents.negative.hue).toBe(330);
		expect(registry.intents.fullTurn.hue).toBe(0);
		expect(registry.intents.overflow.hue).toBe(30);
	});

	it('preserves chroma', () => {
		const registry = createIntentRegistry({
			brand: { chroma: 0.142, hue: 260 },
		});

		expect(registry.intents.brand.chroma).toBe(0.142);
	});

	it('freezes the registry and intent definitions', () => {
		const registry = createIntentRegistry({
			brand: { chroma: 0.14, hue: 260 },
		});

		expect(Object.isFrozen(registry)).toBe(true);
		expect(Object.isFrozen(registry.intents)).toBe(true);
		expect(Object.isFrozen(registry.intents.brand)).toBe(true);
	});

	it('rejects invalid intent names', () => {
		expect(() => createIntentRegistry({ '': { chroma: 0, hue: 0 } })).toThrow(
			'Intent name must not be empty.',
		);
		expect(() =>
			createIntentRegistry({ 'brand primary': { chroma: 0, hue: 0 } }),
		).toThrow('Intent name "brand primary" must not contain whitespace.');
		expect(() =>
			createIntentRegistry({ 'brand.primary': { chroma: 0, hue: 0 } }),
		).toThrow('Intent name "brand.primary" must use a flat namespace.');
	});

	it('rejects intent names that encode axes or visual implementation details', () => {
		expect(() =>
			createIntentRegistry({ incomeStrong: { chroma: 0, hue: 0 } }),
		).toThrow(
			'Intent name "incomeStrong" must describe meaning only and must not encode level.',
		);
		expect(() =>
			createIntentRegistry({ incomeHover: { chroma: 0, hue: 0 } }),
		).toThrow(
			'Intent name "incomeHover" must describe meaning only and must not encode state.',
		);
		expect(() =>
			createIntentRegistry({ incomeOverlay: { chroma: 0, hue: 0 } }),
		).toThrow(
			'Intent name "incomeOverlay" must describe meaning only and must not encode relation.',
		);
		expect(() =>
			createIntentRegistry({ textIncome: { chroma: 0, hue: 0 } }),
		).toThrow(
			'Intent name "textIncome" must describe meaning only and must not encode usage.',
		);
		expect(() =>
			createIntentRegistry({ redAlert: { chroma: 0, hue: 0 } }),
		).toThrow(
			'Intent name "redAlert" must describe meaning only and must not encode visual.',
		);
	});

	it('rejects non-finite intent channels', () => {
		expect(() =>
			createIntentRegistry({ brand: { chroma: 0, hue: Number.NaN } }),
		).toThrow('Intent "brand" hue must be a finite number.');
		expect(() =>
			createIntentRegistry({
				brand: { chroma: 0, hue: Number.POSITIVE_INFINITY },
			}),
		).toThrow('Intent "brand" hue must be a finite number.');
		expect(() =>
			createIntentRegistry({ brand: { chroma: Number.NaN, hue: 0 } }),
		).toThrow('Intent "brand" chroma must be a finite number.');
		expect(() =>
			createIntentRegistry({
				brand: { chroma: Number.NEGATIVE_INFINITY, hue: 0 },
			}),
		).toThrow('Intent "brand" chroma must be a finite number.');
	});

	it('rejects negative chroma', () => {
		expect(() =>
			createIntentRegistry({ brand: { chroma: -0.1, hue: 260 } }),
		).toThrow('Intent "brand" chroma must be greater than or equal to 0.');
	});
});

describe('intent lookup', () => {
	const registry = createIntentRegistry({
		brand: { chroma: 0.14, hue: 260 },
		neutral: { chroma: 0, hue: 0 },
	});

	it('returns a registered intent', () => {
		expect(getIntent(registry, 'brand')).toEqual({ chroma: 0.14, hue: 260 });
	});

	it('checks intent existence', () => {
		expect(hasIntent(registry, 'brand')).toBe(true);
		expect(hasIntent(registry, 'refund')).toBe(false);
	});

	it('throws for unknown intents', () => {
		expect(() => getIntent(registry, 'refund')).toThrow(
			'Unknown intent "refund". Did you forget to register it in the Intent Registry?',
		);
		expect(() => getIntent(registry, 'refund')).toThrow(PaletteKitError);
	});
});
