import type { TokenRegistry } from "../../types/index.js";

/**
 * Modern preset aimed at richer UI surfaces with strong emphasis options.
 */
export const modernUiTokens: TokenRegistry = {
  tokens: {
    "bg.app": {
      name: "bg.app",
      description: "Primary application background.",
      category: "background",
      query: { role: "bg.app", usage: "bg", surface: "app" },
    },
    "bg.surface": {
      name: "bg.surface",
      description: "Default surface background for content containers.",
      category: "background",
      query: { role: "bg.surface", usage: "bg", surface: "surface" },
    },
    "bg.subtle": {
      name: "bg.subtle",
      description: "Subtle surface for secondary sections.",
      category: "background",
      query: { role: "bg.subtle", usage: "bg", surface: "subtle" },
    },
    "bg.solid": {
      name: "bg.solid",
      description: "Solid surface for emphasized elements.",
      category: "background",
      query: { role: "bg.solid", usage: "bg", surface: "solid" },
      states: { hover: true, active: true },
    },
    "text.primary": {
      name: "text.primary",
      description: "Primary text for default surfaces.",
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
      description: "Inverse text for solid or accented surfaces.",
      category: "text",
      query: { role: "text.inverse", usage: "text", surface: "solid", emphasis: "inverted" },
    },
    "border.default": {
      name: "border.default",
      description: "Default border for containers and layout.",
      category: "border",
      query: { role: "border.default", usage: "border", surface: "surface" },
    },
    "border.strong": {
      name: "border.strong",
      description: "High-emphasis border for focused containers.",
      category: "border",
      query: { role: "border.strong", usage: "border", surface: "surface", emphasis: "strong" },
      states: { hover: true },
    },
    "icon.default": {
      name: "icon.default",
      description: "Primary icon color for default surfaces.",
      category: "icon",
      query: { role: "icon.default", usage: "icon", surface: "surface" },
      states: { hover: true },
    },
    "icon.muted": {
      name: "icon.muted",
      description: "Muted icons for less prominent actions.",
      category: "icon",
      query: { role: "icon.muted", usage: "icon", surface: "surface", emphasis: "muted" },
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
