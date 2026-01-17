import { describe, expect, it } from "vitest";

import { scoreApca, scoreContrast } from "./scoring.js";
import type { ContrastRequirement } from "../types/index.js";
import type { ContrastCheckResult } from "./types.js";

describe("scoreApca", () => {
  it("prefers values closer to target within range", () => {
    const target = 60;
    const min = 50;
    const max = 80;
    const hasMax = true;

    expect(scoreApca(60, target, min, max, hasMax)).toBeGreaterThan(
      scoreApca(80, target, min, max, hasMax),
    );
  });

  it("penalizes values outside the range", () => {
    const target = 60;
    const min = 50;
    const max = 80;
    const hasMax = true;

    expect(scoreApca(40, target, min, max, hasMax)).toBeLessThan(0);
    expect(scoreApca(90, target, min, max, hasMax)).toBeLessThan(0);
  });

  it("penalizes below min and prefers target when no max", () => {
    const target = 60;
    const min = 50;
    const max = Number.POSITIVE_INFINITY;
    const hasMax = false;

    expect(scoreApca(40, target, min, max, hasMax)).toBeLessThan(
      scoreApca(55, target, min, max, hasMax),
    );
    expect(scoreApca(60, target, min, max, hasMax)).toBeGreaterThan(
      scoreApca(70, target, min, max, hasMax),
    );
  });
});

describe("scoreContrast", () => {
  describe("with APCA contrast model", () => {
    it("delegates to scoreApca with correct parameters when maxLc is defined", () => {
      const result: ContrastCheckResult = {
        model: "apca",
        target: 60,
        value: 65,
        pass: true,
      };
      const req: ContrastRequirement = {
        model: "apca",
        targetLc: 60,
        minLc: 50,
        maxLc: 80,
      };

      const score = scoreContrast(result, req);
      const expectedScore = scoreApca(65, 60, 50, 80, true);
      
      expect(score).toBe(expectedScore);
    });

    it("delegates to scoreApca without max when maxLc is undefined", () => {
      const result: ContrastCheckResult = {
        model: "apca",
        target: 60,
        value: 65,
        pass: true,
      };
      const req: ContrastRequirement = {
        model: "apca",
        targetLc: 60,
        minLc: 50,
      };

      const score = scoreContrast(result, req);
      const expectedScore = scoreApca(65, 60, 50, Number.POSITIVE_INFINITY, false);
      
      expect(score).toBe(expectedScore);
    });

    it("uses targetLc as min when minLc is undefined", () => {
      const result: ContrastCheckResult = {
        model: "apca",
        target: 60,
        value: 65,
        pass: true,
      };
      const req: ContrastRequirement = {
        model: "apca",
        targetLc: 60,
      };

      const score = scoreContrast(result, req);
      const expectedScore = scoreApca(65, 60, 60, Number.POSITIVE_INFINITY, false);
      
      expect(score).toBe(expectedScore);
    });
  });

  describe("with WCAG2 contrast model", () => {
    it("returns the raw contrast value", () => {
      const result: ContrastCheckResult = {
        model: "wcag2",
        target: 4.5,
        value: 7.2,
        pass: true,
      };
      const req: ContrastRequirement = {
        model: "wcag2",
        minRatio: 4.5,
      };

      const score = scoreContrast(result, req);
      
      expect(score).toBe(7.2);
    });
  });

  describe("with NaN or non-finite values", () => {
    it("returns NEGATIVE_INFINITY for NaN", () => {
      const result: ContrastCheckResult = {
        model: "apca",
        target: 60,
        value: Number.NaN,
        pass: false,
      };
      const req: ContrastRequirement = {
        model: "apca",
        targetLc: 60,
        minLc: 50,
      };

      const score = scoreContrast(result, req);
      
      expect(score).toBe(Number.NEGATIVE_INFINITY);
    });

    it("returns NEGATIVE_INFINITY for positive infinity", () => {
      const result: ContrastCheckResult = {
        model: "apca",
        target: 60,
        value: Number.POSITIVE_INFINITY,
        pass: false,
      };
      const req: ContrastRequirement = {
        model: "apca",
        targetLc: 60,
        minLc: 50,
      };

      const score = scoreContrast(result, req);
      
      expect(score).toBe(Number.NEGATIVE_INFINITY);
    });

    it("returns NEGATIVE_INFINITY for negative infinity", () => {
      const result: ContrastCheckResult = {
        model: "wcag2",
        target: 4.5,
        value: Number.NEGATIVE_INFINITY,
        pass: false,
      };
      const req: ContrastRequirement = {
        model: "wcag2",
        minRatio: 4.5,
      };

      const score = scoreContrast(result, req);
      
      expect(score).toBe(Number.NEGATIVE_INFINITY);
    });
  });
});
