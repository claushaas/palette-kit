import { describe, expect, it } from 'vitest';

import * as publicApi from '../../index.js';
import { PaletteKitError } from '../../utils/errors/errors.js';
import {
	assertContext,
	CONTEXTS,
	type Context,
	type ContextCurveValues,
	createContextCurveHook,
	isContext,
	resolveContext,
} from './context.js';

const invalidContextError =
	'Invalid context "sepia". Expected one of: light, dark.';

describe('context validation', () => {
	it('accepts canonical contexts', () => {
		for (const context of CONTEXTS) {
			expect(isContext(context)).toBe(true);
			expect(() => assertContext(context)).not.toThrow();
		}
	});

	it('rejects unknown contexts and non-string values', () => {
		expect(isContext('sepia')).toBe(false);
		expect(isContext('')).toBe(false);
		expect(isContext(null)).toBe(false);
		expect(isContext(1)).toBe(false);
		expect(isContext({ context: 'light' })).toBe(false);
	});

	it('throws a clear error for invalid contexts', () => {
		expect(() => assertContext('sepia')).toThrow(invalidContextError);
	});

	it('freezes canonical contexts', () => {
		expect(Object.isFrozen(CONTEXTS)).toBe(true);
	});
});

describe('context precedence', () => {
	it('prefers resolver context over palette and system defaults', () => {
		expect(
			resolveContext({
				paletteContext: 'light',
				resolverContext: 'dark',
				systemDefaultContext: 'light',
			}),
		).toBe('dark');
	});

	it('prefers palette context over system default', () => {
		expect(
			resolveContext({
				paletteContext: 'dark',
				systemDefaultContext: 'light',
			}),
		).toBe('dark');
	});

	it('uses system default as the final fallback', () => {
		expect(resolveContext({ systemDefaultContext: 'light' })).toBe('light');
	});

	it('rejects invalid contexts at any provided level', () => {
		expect(() => resolveContext({ resolverContext: 'sepia' })).toThrow(
			invalidContextError,
		);
		expect(() => resolveContext({ paletteContext: 'sepia' })).toThrow(
			invalidContextError,
		);
		expect(() => resolveContext({ systemDefaultContext: 'sepia' })).toThrow(
			invalidContextError,
		);
	});

	it('throws when no context can be resolved', () => {
		expect(() => resolveContext({})).toThrow(
			'Context could not be resolved. Provide resolverContext, paletteContext, or systemDefaultContext.',
		);
		expect(() => resolveContext({})).toThrow(PaletteKitError);
	});
});

describe('context curve hooks', () => {
	it('returns a frozen hook', () => {
		const hook = createContextCurveHook({ dark: 12, light: 98 });

		expect(Object.isFrozen(hook)).toBe(true);
	});

	it('returns distinct values by context', () => {
		const hook = createContextCurveHook({ dark: 12, light: 98 });

		expect(hook('light')).toBe(98);
		expect(hook('dark')).toBe(12);
	});

	it('validates context passed to the hook', () => {
		const hook = createContextCurveHook({ dark: 12, light: 98 });

		expect(() => hook('sepia' as Context)).toThrow(invalidContextError);
	});

	it('preserves an internal frozen copy of curve values', () => {
		const values = { dark: 12, light: 98 } satisfies ContextCurveValues<number>;
		const hook = createContextCurveHook(values);

		values.light = 80;
		values.dark = 20;

		expect(hook('light')).toBe(98);
		expect(hook('dark')).toBe(12);
	});

	it('does not expose context APIs from the public entrypoint', () => {
		expect(Object.keys(publicApi)).toEqual(['createPaletteKit']);
	});
});
