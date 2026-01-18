import type { TokenRegistry } from "../../types/index.js";

/**
 * Radix-like preset aligned with common component library semantics.
 * Expands coverage for subtle/surface/solid layers and semantic text.
 */
export const radixLikeUiTokens: TokenRegistry = {
  tokens: {
    "bg.app": {
      name: "bg.app",
      description: "Application background for the overall canvas.",
      category: "background",
      query: { role: "bg.app", usage: "bg", surface: "app" },
    },
    "bg.surface": {
      name: "bg.surface",
      description: "Base surface background for cards and panels.",
      category: "background",
      query: { role: "bg.surface", usage: "bg", surface: "surface" },
    },
    "bg.subtle": {
      name: "bg.subtle",
      description: "Subtle background for secondary sections.",
      category: "background",
      query: { role: "bg.subtle", usage: "bg", surface: "subtle" },
    },
    "bg.solid": {
      name: "bg.solid",
      description: "Solid background for high-emphasis elements.",
      category: "background",
      query: { role: "bg.solid", usage: "bg", surface: "solid" },
      states: { hover: true, active: true },
    },
    "text.primary": {
      name: "text.primary",
      description: "Primary text on standard surfaces.",
      category: "text",
      query: { role: "text.primary", usage: "text", surface: "surface" },
    },
    "text.secondary": {
      name: "text.secondary",
      description: "Secondary text for supporting content.",
      category: "text",
      query: { role: "text.secondary", usage: "text", surface: "surface", emphasis: "muted" },
    },
    "text.inverse": {
      name: "text.inverse",
      description: "Inverse text for solid backgrounds.",
      category: "text",
      query: { role: "text.inverse", usage: "text", surface: "solid", emphasis: "inverted" },
    },
    "border.default": {
      name: "border.default",
      description: "Default border for layout and surfaces.",
      category: "border",
      query: { role: "border.default", usage: "border", surface: "surface" },
    },
    "border.subtle": {
      name: "border.subtle",
      description: "Subtle border for separators.",
      category: "border",
      query: { role: "border.subtle", usage: "border", surface: "subtle" },
    },
    "icon.default": {
      name: "icon.default",
      description: "Default icon color on surfaces.",
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
