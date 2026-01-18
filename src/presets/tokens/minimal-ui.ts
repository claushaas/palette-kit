import type { TokenRegistry } from "../../types/index.js";

/**
 * Minimal token preset aimed at quick adoption.
 * Focuses on a small, coherent base set for app surfaces and text.
 */
export const minimalUiTokens: TokenRegistry = {
  tokens: {
    "bg.app": {
      name: "bg.app",
      description: "Base application background.",
      category: "background",
      query: { role: "bg.app", usage: "bg", surface: "app" },
    },
    "bg.surface": {
      name: "bg.surface",
      description: "Default surface background for containers.",
      category: "background",
      query: { role: "bg.surface", usage: "bg", surface: "surface" },
    },
    "text.primary": {
      name: "text.primary",
      description: "Primary text on standard surfaces.",
      category: "text",
      query: { role: "text.primary", usage: "text", surface: "surface" },
    },
    "text.secondary": {
      name: "text.secondary",
      description: "Secondary text on standard surfaces.",
      category: "text",
      query: { role: "text.secondary", usage: "text", surface: "surface", emphasis: "muted" },
    },
    "border.default": {
      name: "border.default",
      description: "Default border for surfaces and containers.",
      category: "border",
      query: { role: "border.default", usage: "border", surface: "surface" },
      states: { hover: true },
    },
    "icon.default": {
      name: "icon.default",
      description: "Default icon color on standard surfaces.",
      category: "icon",
      query: { role: "icon.default", usage: "icon", surface: "surface" },
      states: { hover: true },
    },
    "ring.default": {
      name: "ring.default",
      description: "Base ring color (derive focus via state operator).",
      category: "ring",
      query: { role: "ring.default", usage: "ring", surface: "surface", emphasis: "strong" },
      states: { focus: true },
    },
  },
};
