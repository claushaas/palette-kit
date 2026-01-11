# Spec de Implementacao - Palette Kit

## 1) Objetivo

Gerar paletas a partir de seeds (cores iniciais), usando OKLCH + APCA conforme `docs/Why.md`. As cores do Radix podem ser usadas apenas como origem opcional de seed (step 9), se o usuario escolher.

## 2) Escopo MVP (v0.1)

- Gerar scale de 12 steps (light/dark) a partir de uma seed.
- Suportar fontes de cor:
  - `seed` (hex direto).
  - `radix` (nome da escala) como entrada opcional do usuario, usando seeds precomputadas.
- OKLCH como espaco de geracao.
- Gamut mapping simples (compressao de C ate caber em sRGB).
- Tokens semanticos basicos (preset `radix-like-ui`).
- Exporters: TS (objeto), JSON e CSS vars.
- Diagnosticos minimos (contrast score e contagem de out-of-gamut).
- Runtime moderno: Node >= 22, TypeScript >= 5.5, ESM.
- Dependencias: `colorjs.io` (OKLCH/conversoes) e `apca-w3` (contraste).

## 3) Fora de escopo imediato (v0.1)

- Saida Display-P3.
- Plugin Tailwind / RN.
- Preview visual e snapshots visuais.
- Diagnosticos avancados (gamut heatmap, relatorio detalhado).

## 4) Tipos e dados (TS)

```ts
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type ColorHex = `#${string}`; // validar em runtime

type RadixSeedName = string; // gerado a partir de `radixSeeds`

type TemplateId = "neutral" | "warm" | "cool";

type ColorSource =
  | { source: "seed"; value: ColorHex }
  | { source: "radix"; name: RadixSeedName };

type Scale = {
  light: Record<Step, ColorHex>;
  dark: Record<Step, ColorHex>;
  meta?: ScaleDiagnostics;
};

type AlphaScale = {
  light: Record<Step, ColorHex>; // #RRGGBBAA
  dark: Record<Step, ColorHex>;
};

type Theme = {
  scales: Record<string, Scale>; // neutral, accent, success, etc.
  tokens: {
    light: Record<string, ColorHex>;
    dark: Record<string, ColorHex>;
  };
  alpha?: AlphaScale;
  diagnostics?: ThemeDiagnostics;
};
```

## 5) APIs propostas

```ts
// gera apenas uma scale
function generateScale(options: {
  source: ColorSource;
  mode?: "light" | "dark" | "both";
  anchorStep?: Step; // default 9
  template?: "auto" | TemplateId;
  curves?: CurveConfig;
  gamut?: { strategy: "compress" | "clip" };
  contrast?: ContrastProfile; // usado para ajustes opcionais
}): Scale;

// compoe tema completo
function createTheme(config: {
  neutral: ColorSource;
  accent: ColorSource;
  semantic?: {
    success?: ColorSource;
    warning?: ColorSource;
    danger?: ColorSource;
  };
  extras?: Record<string, ColorSource>; // category1, chart1, etc
  tokens?: { preset?: "radix-like-ui"; overrides?: TokenOverrides };
  alpha?: { enabled?: boolean; background?: { light?: ColorHex; dark?: ColorHex } };
  contrast?: ContrastProfile;
  output?: { format?: "ts" | "json" | "css"; cssVarPrefix?: string };
}): Theme;
```

## 6) Engine (geracao da scale)

Passos (light/dark iguais, com templates diferentes):

1. Converter seed para OKLCH.
2. Selecionar template interno (auto por hue ou `template` fixo).
3. Ancorar seed no `anchorStep` (default 9):
   - `dL = L_seed - L_template[anchor]`
   - `dC = C_seed - C_template[anchor]`
   - `dH = H_seed - H_template[anchor]`
4. Aplicar deltas por step, com curvas por faixa (L/C). Exemplo inicial:
   - L: 1-2 (0.25-0.35), 3-5 (0.55-0.70), 6-8 (0.75-0.90), 9-12 (1.0)
   - C: 1-2 (0.15-0.25), 3-5 (0.50-0.70), 6-8 (0.70-0.90), 9-10 (1.0), 11-12 (0.60-0.80)
5. Gamut mapping: converter para sRGB e, se fora do gamut, reduzir C ate caber.
6. Converter para hex.

## 7) Templates

- Templates internos (v0.1): `neutral`, `warm`, `cool`, definidos como curvas de L/C base em OKLCH.
- `auto` escolhe o template pela proximidade de hue (ex.: quentes vs frias).
- Formato sugerido:

```ts
const templates = {
  light: { [templateId]: OKLCHStepMap },
  dark: { [templateId]: OKLCHStepMap },
};


```

- `templateId` e fixo (neutral, warm, cool). Ajustes futuros podem calibrar com Radix.

## 8) Contrast solver (APCA)

- Aplicar nos tokens criticos: `text.primary`, `text.secondary`, `onSolid.textPrimary`.
- Priorizar ajuste de L, reduzir C se necessario.
- Metas iniciais (ajustaveis por perfil):
  - `text.primary`: Lc 75-90
  - `text.secondary`: Lc 55-70
  - `onSolid.textPrimary`: Lc 60-75
- Lib sugerida: `apca-w3` com fallback para WCAG2 ratio.

## 9) Alpha scales

- Gerar `a1..a12` para light/dark.
- Entrada: base color (step 9) + background (default light #ffffff, dark #111111).
- Metodo inicial: curva fixa de alpha por step + mesma cor base.
- Curva default (inspirada no alpha do Radix black/white): `0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 0.95`.
- Saida: #RRGGBBAA.

## 10) Token composer (preset radix-like-ui)

Mapeamento minimo (de `docs/Why.md`):

- `bg.app` -> neutral 1
- `bg.subtle` -> neutral 2
- `surface.card` -> neutral 2
- `surface.raised` -> neutral 3
- `component.bg` -> neutral 3
- `component.bgHover` -> neutral 4
- `component.bgActive` -> neutral 5
- `border.subtle` -> neutral 6
- `border.default` -> neutral 7
- `focus.ring` -> accent 8
- `accent.solid` -> accent 9
- `accent.solidHover` -> accent 10
- `text.secondary` -> neutral 11 (solver pode ajustar)
- `text.primary` -> neutral 12 (solver pode ajustar)
- `onSolid.textPrimary` -> solver escolhe white/black (+ alpha)

## 11) Exporters

- `toJson(theme)`
- `toCssVars(theme, { prefix })`
- `toTs(theme)` (objeto exportavel)

## 12) Diagnostics (minimo)

- Contagem de steps fora do gamut (por scale).
- APCA score dos tokens criticos.
- Avisos: seed muito cinza, seed muito escura para light, etc.

## 13) Estrutura sugerida

```text
src/
  index.ts
  generateScale.ts
  createTheme.ts
  types.ts
  data/
    radixSeeds.ts
  engine/
    templates.ts
    curves.ts
    gamut.ts
    oklch.ts
  contrast/
    apca.ts
  alpha/
    generateAlphaScale.ts
  tokens/
    presetRadixLikeUi.ts
  exporters/
    toJson.ts
    toCssVars.ts
    toTs.ts
  diagnostics/
    analyzeScale.ts
```

## 14) Testes (v0.1)

- `generateScale` deterministico (snapshot de steps).
- Selecionar template por hue (seed rosa pega template rosa, etc).
- Gamut mapping nao estoura (todas cores em sRGB).
- `createTheme` gera tokens basicos.
- Contrast solver atinge metas (com tolerancia).

## 15) Decisoes fechadas

1) Radix como seed (step 9).
2) Incluir apenas seeds do Radix no repo.
3) OKLCH via `colorjs.io`.
4) APCA via `apca-w3` (com fallback WCAG2).
5) Steps internos como `Record<Step, ColorHex>`.
6) Alpha: base step 9 com curva fixa (0.05..0.95).
7) Token preset: iniciar com o mapa do `docs/Why.md`.
8) Tokens em dot notation.
9) Runtime alvo: Node >= 22 (ESM) e TS >= 5.5.
