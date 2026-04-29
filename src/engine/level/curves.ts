import type { Context } from '../context/context.js';
import type { Usage } from '../usage/strategy.js';
import { assertLevel, type Level } from './level.js';

export type LevelDrivenUsage = Exclude<Usage, 'visualVocabulary'>;

export type LevelCurve<T> = (level: Level, context: Context) => T;

export type FillLevelCurve = LevelCurve<number>;

export type LinesLevelCurve = LevelCurve<number>;

export type OverlayLevelResult = Readonly<{
	luminanceDelta: number;
}>;

export type OverlaysLevelCurve = LevelCurve<OverlayLevelResult>;

export type LevelCurveConfig = Readonly<{
	fill: FillLevelCurve;
	lines: LinesLevelCurve;
	overlays: OverlaysLevelCurve;
}>;

const fillLevelTargets = Object.freeze({
	1: 98,
	2: 96,
	3: 94,
	4: 91,
	5: 88,
	6: 84,
	7: 79,
	8: 73,
	9: 66,
} satisfies Record<Level, number>);

const linesLevelTargets = Object.freeze({
	1: 96,
	2: 95,
	3: 94,
	4: 92,
	5: 90,
	6: 88,
	7: 86,
	8: 84,
	9: 82,
} satisfies Record<Level, number>);

const overlayLevelTargets = Object.freeze({
	1: Object.freeze({ luminanceDelta: 1 }),
	2: Object.freeze({ luminanceDelta: 2 }),
	3: Object.freeze({ luminanceDelta: 3 }),
	4: Object.freeze({ luminanceDelta: 4 }),
	5: Object.freeze({ luminanceDelta: 5 }),
	6: Object.freeze({ luminanceDelta: 6 }),
	7: Object.freeze({ luminanceDelta: 7 }),
	8: Object.freeze({ luminanceDelta: 8 }),
	9: Object.freeze({ luminanceDelta: 9 }),
} satisfies Record<Level, OverlayLevelResult>);

const resolveContextualLightness = (lightness: number, context: Context) =>
	context === 'dark' ? 100 - lightness : lightness;

export const defaultLevelCurves: LevelCurveConfig = Object.freeze({
	fill(level, context) {
		assertLevel(level);
		return resolveContextualLightness(fillLevelTargets[level], context);
	},
	lines(level, context) {
		assertLevel(level);
		return resolveContextualLightness(linesLevelTargets[level], context);
	},
	overlays(level, _context) {
		assertLevel(level);
		return overlayLevelTargets[level];
	},
});
