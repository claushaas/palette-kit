import type { ColorHex, Scale, Step } from "../types.js";

type TokenMapEntry = {
  token: string;
  slot: string;
  step: Step;
  required?: boolean;
};

const tokenMap: TokenMapEntry[] = [
  { token: "bg.app", slot: "neutral", step: 1 },
  { token: "bg.subtle", slot: "neutral", step: 2 },
  { token: "surface.card", slot: "neutral", step: 2 },
  { token: "surface.raised", slot: "neutral", step: 3 },
  { token: "component.bg", slot: "neutral", step: 3 },
  { token: "component.bgHover", slot: "neutral", step: 4 },
  { token: "component.bgActive", slot: "neutral", step: 5 },
  { token: "border.subtle", slot: "neutral", step: 6 },
  { token: "border.default", slot: "neutral", step: 7 },
  { token: "border.strong", slot: "neutral", step: 8 },
  { token: "text.secondary", slot: "neutral", step: 11 },
  { token: "text.primary", slot: "neutral", step: 12 },
  { token: "text.disabled", slot: "neutral", step: 10 },

  { token: "focus.ring", slot: "accent", step: 8 },
  { token: "accent.solid", slot: "accent", step: 9 },
  { token: "accent.solidHover", slot: "accent", step: 10 },
  { token: "accent.border", slot: "accent", step: 7 },
  { token: "accent.subtle", slot: "accent", step: 3 },
  { token: "accent.subtleHover", slot: "accent", step: 4 },

  { token: "status.success.solidBg", slot: "success", step: 9, required: false },
  { token: "status.success.solidHover", slot: "success", step: 10, required: false },
  { token: "status.success.subtleBg", slot: "success", step: 3, required: false },
  { token: "status.success.border", slot: "success", step: 7, required: false },
  { token: "status.success.text", slot: "success", step: 11, required: false },
  { token: "status.success.textStrong", slot: "success", step: 12, required: false },

  { token: "status.warning.solidBg", slot: "warning", step: 9, required: false },
  { token: "status.warning.solidHover", slot: "warning", step: 10, required: false },
  { token: "status.warning.subtleBg", slot: "warning", step: 3, required: false },
  { token: "status.warning.border", slot: "warning", step: 7, required: false },
  { token: "status.warning.text", slot: "warning", step: 11, required: false },
  { token: "status.warning.textStrong", slot: "warning", step: 12, required: false },

  { token: "status.danger.solidBg", slot: "danger", step: 9, required: false },
  { token: "status.danger.solidHover", slot: "danger", step: 10, required: false },
  { token: "status.danger.subtleBg", slot: "danger", step: 3, required: false },
  { token: "status.danger.border", slot: "danger", step: 7, required: false },
  { token: "status.danger.text", slot: "danger", step: 11, required: false },
  { token: "status.danger.textStrong", slot: "danger", step: 12, required: false },
];

export function buildPresetTokens(scales: Record<string, Scale>): {
  light: Record<string, ColorHex>;
  dark: Record<string, ColorHex>;
} {
  const light: Record<string, ColorHex> = {};
  const dark: Record<string, ColorHex> = {};

  for (const { token, slot, step, required } of tokenMap) {
    const scale = scales[slot];
    if (!scale) {
      if (required === false) {
        continue;
      }
      throw new Error(`Missing scale for slot: ${slot}`);
    }

    light[token] = scale.light[step];
    dark[token] = scale.dark[step];
  }

  return { light, dark };
}
