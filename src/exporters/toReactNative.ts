import type { Theme } from "../types.js";

type ReactNativeOptions = {
  includeTokens?: boolean;
  includeScales?: boolean;
  includeAlpha?: boolean;
  includeOverlays?: boolean;
  includeP3?: boolean;
};

type Mode = "light" | "dark";

type ModeTokens<T extends Theme, O extends ReactNativeOptions, M extends Mode> = O extends {
  includeTokens: false;
}
  ? Record<string, never>
  : T["tokens"][M];

type ModeScales<T extends Theme, O extends ReactNativeOptions, M extends Mode> = O extends {
  includeScales: false;
}
  ? Record<string, never>
  : {
      [K in keyof T["scales"]]: T["scales"][K][M];
    };

type ThemeAlpha<T extends Theme> = T["alpha"] extends undefined ? undefined : T["alpha"];

type ModeAlpha<T extends Theme, O extends ReactNativeOptions, M extends Mode> = O extends {
  includeAlpha: false;
}
  ? undefined
  : ThemeAlpha<T> extends undefined
    ? undefined
    : ThemeAlpha<T> extends Record<string, { light: infer L; dark: infer D }>
      ? M extends "light"
        ? Record<string, L>
        : Record<string, D>
      : undefined;

type ModeOverlays<T extends Theme, O extends ReactNativeOptions> = O extends {
  includeOverlays: false;
}
  ? undefined
  : T["overlay"];

type ModeP3<T extends Theme, O extends ReactNativeOptions, M extends Mode> = O extends {
  includeP3: true;
}
  ? Partial<{
      [K in keyof T["scales"]]: T["scales"][K] extends {
        p3?: { light: infer L; dark: infer D };
      }
        ? M extends "light"
          ? L
          : D
        : never;
    }>
  : undefined;

type ReactNativeTheme<T extends Theme, O extends ReactNativeOptions> = {
  overlay: ModeOverlays<T, O>;
  light: {
    tokens: ModeTokens<T, O, "light">;
    scales: ModeScales<T, O, "light">;
    alpha: ModeAlpha<T, O, "light">;
    p3: ModeP3<T, O, "light">;
  };
  dark: {
    tokens: ModeTokens<T, O, "dark">;
    scales: ModeScales<T, O, "dark">;
    alpha: ModeAlpha<T, O, "dark">;
    p3: ModeP3<T, O, "dark">;
  };
};

export function toReactNative<T extends Theme, O extends ReactNativeOptions = ReactNativeOptions>(
  theme: T,
  options?: O,
): ReactNativeTheme<T, O> {
  const includeTokens = options?.includeTokens ?? true;
  const includeScales = options?.includeScales ?? true;
  const includeAlpha = options?.includeAlpha ?? true;
  const includeOverlays = options?.includeOverlays ?? true;
  const includeP3 = options?.includeP3 ?? false;

  function buildMode<M extends Mode>(mode: M) {
    const scales = includeScales
      ? (Object.fromEntries(
          Object.entries(theme.scales).map(([slot, scale]) => [slot, scale[mode]]),
        ) as ModeScales<T, O, M>)
      : ({} as Record<string, never> as ModeScales<T, O, M>);
    const p3 = includeP3
      ? (Object.fromEntries(
          Object.entries(theme.scales)
            .filter(([, scale]) => scale.p3?.[mode])
            .map(([slot, scale]) => [slot, scale.p3?.[mode]]),
        ) as ModeP3<T, O, M>)
      : (undefined as ModeP3<T, O, M>);
    const alpha = includeAlpha
      ? (theme.alpha
          ? (Object.fromEntries(
              Object.entries(theme.alpha).map(([slot, scale]) => [slot, scale[mode]]),
            ) as ModeAlpha<T, O, M>)
          : (undefined as ModeAlpha<T, O, M>))
      : (undefined as ModeAlpha<T, O, M>);
    return {
      tokens: (includeTokens ? theme.tokens[mode] : {}) as Record<string, never> as ModeTokens<T, O, M>,
      scales,
      alpha,
      p3,
    };
  }

  return {
    overlay: (includeOverlays ? theme.overlay : undefined) as ModeOverlays<T, O>,
    light: buildMode("light"),
    dark: buildMode("dark"),
  } as ReactNativeTheme<T, O>;
}
