# Palette Kit — SPEC completa (nova versão)

> **Objetivo desta SPEC**
>
> Criar uma especificação completa e operacional da **Palette Kit**, uma biblioteca moderna de **paletas semânticas**, incorporando **tudo** o que foi discutido no chat (ontem) e registrado no próprio chat e no material anexado.
>
> Esta SPEC deve permitir:
>
> 1. um dev humano implementar passo a passo
> 2. uma IA implementar incrementalmente, sem lacunas
>
> Sempre que algum detalhe essencial não estiver explícito, eu marco como **[ASSUNÇÃO]** (com justificativa) e/ou listo em **[PENDÊNCIAS]**.

---

## Índice

1. Visão geral
2. Fundamentos teóricos (por quê isso funciona)
   - 2.1 sRGB vs Display-P3 (P3)
   - 2.2 OKLCH (o espaço de cor base do sistema)
   - 2.3 Contraste moderno: APCA (e fallback WCAG2)
3. Princípios do sistema semântico (o “modelo mental”)
4. Padrões semânticos suportados (além do Radix)
5. Produto da biblioteca (o que ela entrega)
6. API pública de consumo (o que o usuário chama)
   - 6.1 Interface principal
   - 6.2 Tipos TypeScript (SPEC COMPLETA)
7. Catálogo de casos de uso (muito completo)
8. Inputs do usuário (como configurar a lib)
9. Algoritmo de geração (como construir o motor)
10. Dependências recomendadas (bibliotecas)
11. Roadmap de implementação (pés no chão)
12. Apêndices

---

## 1. Visão geral

### O que é a Palette Kit

A **Palette Kit** é uma biblioteca que resolve o problema de cores em UI como um **sistema semântico**:

- Você descreve **a intenção** (o que é: texto, fundo, ação, alerta, categoria)
- Você descreve **o contexto** (modo claro/escuro, tipo de superfície, estado)
- O motor calcula **a cor ideal** (e exporta em formatos adequados)

Em vez de “escolher um hex” ou “pegar o step 9”, o consumidor usa uma API do tipo:

```ts
theme.resolve({
  role: "action.primary",
  usage: "bg",
  surface: "solid",
  state: "hover",
  context: "dark",
})
```

E obtém um `ResolvedColor` com:

- sRGB (fallback)
- OKLCH (CSS moderno)
- opcional Display-P3 (para telas modernas)
- metadados (contraste, gamut, provenance)

### Para que ela serve (web + mobile)

- **Web**: gerar **CSS variables** com fallback sRGB e progressive enhancement com `oklch()`/P3.
- **Mobile**: fornecer tokens em JS/TS (para RN/Expo) e/ou export JSON.
- **Design system**: padronizar cor por “linguagem semântica”, reduzindo disputa de “qual azul usar”.

### Qual problema ela resolve

- **Token explosion**: em sistemas clássicos, cada variação vira token (bgHover, bgActive, solidBgHover…).
- **Inconsistência**: diferentes telas/teams escolhem cores por tentativa e erro.
- **Acessibilidade**: contraste vira afterthought.
- **Escalabilidade**: adicionar cores fora do Radix (categorias, charts, features) é doloroso e inconsistente.

### O que ela NÃO é

- Não é “uma paleta fixa de hex”.
- Não é “apenas tema claro/escuro”.
- Não obriga o usuário a entender teoria de cor (OKLCH/APCA/P3) para usar.
- Não é um clone do Radix: ela generaliza o conceito para padrões modernos (categorias, data viz, overlays, etc.).

---

## 2. Fundamentos teóricos (por quê isso funciona)

### 2.1 sRGB vs Display-P3 (P3)

#### O que é P3 e por que importa hoje

- **sRGB**: gamut menor, “padrão histórico” da web.
- **Display-P3**: gamut maior, comum em telas modernas (especialmente Apple). Permite cores mais vivas sem “neonizar”.

**Por que isso muda o jogo:**

- Cores geradas em espaços perceptuais (OKLCH) frequentemente **não cabem em sRGB**.
- P3 reduz a necessidade de “achatamento” e preserva intenção visual.

#### Estratégia “progressive enhancement” (fallback sRGB + override OKLCH/P3)

A saída recomendada para Web:

1. Sempre exportar **fallback sRGB** (`#RRGGBB`)
2. Sob `@supports`, exportar **OKLCH** (ou P3)

Exemplo recomendado:

```css
:root {
  --action-primary: #3d63dd; /* fallback */
}
@supports (color: oklch(50% 0.2 260)) {
  :root {
    --action-primary: oklch(55% 0.22 260);
  }
}
```

**[ASSUNÇÃO]**: Para P3 explícito, usar `color(display-p3 r g b)` quando fizer sentido (ex.: charts) e quando a lib tiver conversão/serialização robusta.

#### Implicações práticas: gamut, clipping, compressão de chroma

Quando uma cor alvo não cabe no gamut:

- **clip**: corta canais → pode distorcer perceptualmente
- **compressChroma**: reduz C até caber → preserva L/H e a intenção
- **preferP3ThenCompress**: tenta P3 antes, e só comprime se nem P3 couber

**Regra default recomendada:** `compressChroma`.

---

### 2.2 OKLCH (o espaço de cor base do sistema)

#### OKLCH em 20 segundos

- **L** (Lightness): claridade (0–100%), perceptual
- **C** (Chroma): vivacidade/saturação, perceptual
- **H** (Hue): matiz (0–360°)

#### Por que OKLCH é melhor que HSL/RGB para algoritmos de escala

- RGB/HSL não são perceptuais: ajustes numéricos iguais não parecem iguais.
- OKLCH permite:
  - escalas suaves
  - interpolação consistente
  - operadores previsíveis (hover/active)
  - ajuste de contraste principalmente mexendo em L (mais estável)

#### Uso direto no CSS

CSS moderno suporta `oklch()`:

```css
color: oklch(62% 0.18 265);
background: oklch(55% 0.22 260 / 0.9);
```

---

### 2.3 Contraste moderno: APCA (e fallback WCAG2)

#### Papel do contraste na biblioteca

A lib deve garantir:

- texto e ícones legíveis
- rings percebíveis
- comportamento previsível em high-contrast

#### APCA vs WCAG2

- **APCA**: mais alinhado à percepção humana para leitura.
- **WCAG2**: ainda necessário como fallback e em alguns contextos de compliance.

#### Como o solver entra

Para `usage: text|icon|ring`, a lib pode usar um **solver** que ajusta cor (principalmente L, e secundariamente C) para bater o target.

**[ASSUNÇÃO] targets iniciais (ajustáveis por perfil):**

- `text.primary`: APCA Lc 75–90
- `text.secondary`: APCA Lc 55–70
- `text.disabled`: APCA Lc \~45 (evitar invisível)
- `icon`: APCA Lc 45–60
- `ring`: APCA Lc \~45

Fallback WCAG2:

- texto normal: ratio ≥ 4.5
- texto grande: ratio ≥ 3.0

---

## 3. Princípios do sistema semântico (o “modelo mental”)

A Palette Kit separa intenções em eixos **ortogonais**:

- **role**: o que é semanticamente (ação, texto, fundo, alerta…)
- **surface**: tipo de superfície (app/surface/subtle/solid/overlay/data/transparent)
- **state**: estado de UI (default/hover/active/disabled/selected/focus…)
- **emphasis**: hierarquia visual (muted/subtle/default/strong/inverted)
- **context**: modo/ambiente (light/dark/highContrast/dimmed)
- **variant**: família (neutral/accent/success/.../category:*/chart:*)

### Por que separar `surface` e `state` resolve o Radix (bgActive vs solidBg)

No Radix, “tipo de fundo” e “estado” estão embutidos em steps.

Na Palette Kit:

- `surface` define a faixa (subtle vs solid)
- `state` define o comportamento (hover/active)

Exemplo:

```ts
// solidBg
theme.resolve({ role: "action.primary", usage: "bg", surface: "solid", state: "default" })

// solidBgHover
theme.resolve({ role: "action.primary", usage: "bg", surface: "solid", state: "hover" })

// bgActive (em surface subtle)
theme.resolve({ role: "list.item", usage: "bg", surface: "subtle", state: "active" })
```

---

## 4. Padrões semânticos suportados (além do Radix)

A lib suporta padrões semânticos sem conflito porque cada um vira eixo/operador.

### 1) Profundidade/Interação (Radix-style)

- **Responde:** quão presente/interativo é.
- **Casos:** app bg, card bg, borders, solids, text.
- **Como vira cor:** curvas de L/C por faixa.
- **Evita token explosion:** `surface + usage` em vez de steps rígidos.

### 2) Estado de UI (state-driven)

- **Responde:** default/hover/active/disabled/selected/focus.
- **Como vira cor:** operador sobre base (ΔL/ΔC/alpha).

### 3) Polaridade/Ênfase (emphasis levels)

- **Responde:** muted/subtle/default/strong/inverted.
- **Como vira cor:** operador em C e L.

### 4) Semântica funcional (success/warning/error/info)

- **Responde:** significado de feedback.
- **Como vira cor:** `variant` troca família mantendo roles.

### 5) Categoria/Identidade (categorical)

- **Responde:** grupos (tags/categorias).
- **Como vira cor:** H por categoria, L/C controlados.

### 6) Dado/Intensidade (data-driven)

- **Responde:** valor (0..1).
- **Como vira cor:** interpolação OKLCH, monotônica em L.
- **[ASSUNÇÃO]**: API vNext com `value` (ver pendências).

---

## 5. Produto da biblioteca (o que ela entrega)

### Tokens em CSS vars

- fallback sRGB
- override OKLCH sob `@supports`
- opcional P3

### Saída em JS/TS

- `ResolvedColor` com múltiplos espaços e `meta`

### Exportadores

- `theme.export.cssVars()`
- `theme.export.json()`

### Diagnósticos/Meta

- provenance (de onde veio)
- contraste (target/resultado)
- gamut mapping (se comprimiu/clippou)

---

## 6. API pública de consumo (o que o usuário chama)

### 6.1 Interface principal

- `theme.resolve(query)`
- `theme.color(role, opts?)`
- `theme.onSolid(query)`
- `theme.resolveMany(queries)`
- `theme.withContext(context)`
- `theme.export.cssVars()` e `theme.export.json()`

### 6.2 Tipos TypeScript (SPEC COMPLETA)

> (Mesma lista discutida no chat; abaixo descreve intenção, quando usar, defaults e exemplos.)

**CssColorString** — string CSS (`#hex`, `oklch()`, `color(display-p3 ...)`).

**ColorSpace** — `srgb | p3 | oklch | oklab`.

**ColorContext** — `light | dark | highContrast | dimmed`.

**SurfaceIntent** — `app | surface | subtle | solid | overlay | data | transparent`.

**ColorState** — `default | hover | active | pressed | selected | focus | disabled | drag | loading`.

**ColorEmphasis** — `muted | subtle | default | strong | inverted`.

**SemanticVariant** — `neutral | accent | success | warning | danger | info | highlight | premium | category:<id> | chart:<id>`.

**ColorRole** — string; recomendação: union gerada por preset.

**ColorUsage** — `bg | border | text | icon | ring | shadow | stroke | fill`.

**BackgroundHint** — `{kind:"auto"}|{kind:"role",role}|{kind:"color",value}`.

**ContrastRequirement** — APCA/WCAG2/none.

**AlphaStrategy** — none/fixed/solveOnBackground.

**OutputOptions** — preferSpace/includeSpaces/gamutMapping/format.

**RawColor** — `{space, channels, alpha}`.

**ColorMeta** — debug/QA (role, surface, state, contrast, gamut, provenance).

**ResolvedColor** — `{ value, srgb?, p3?, oklch?, oklab?, raw?, alpha, meta }`.

**ColorQuery** — `{ role, variant?, usage?, context?, surface?, state?, emphasis?, on?, contrast?, alpha?, output? }`.

**OnSolidQuery** — `{ bgRole, usage:"text"|"icon", context?, state?, emphasis?, alpha?, contrast?, output? }`.

**SemanticColorTheme** — interface pública com métodos citados.

**RoleAccessor/TypedThemeAccessors** — DX opcional (accessors tipados) **[ASSUNÇÃO]**.

---

## 7. Catálogo de casos de uso (muito completo)

> A seção abaixo cobre exemplos concretos e explica as props.

### App background / surface / card / raised

```ts
theme.resolve({ role: "bg.app", usage: "bg", context: "light", surface: "app" })

theme.resolve({ role: "surface.card", usage: "bg", context: "light", surface: "surface" })

theme.resolve({ role: "surface.raised", usage: "bg", context: "light", surface: "surface", emphasis: "strong" })
```

### Bordas e separadores

```ts
theme.resolve({ role: "border.subtle", usage: "border", context: "dark", surface: "surface", emphasis: "subtle" })
```

### Texto primário/secundário/muted/disabled

```ts
theme.resolve({
  role: "text.primary",
  usage: "text",
  context: "dark",
  surface: "surface",
  on: { kind: "role", role: "surface.card" },
  contrast: { model: "apca", targetLc: 80 },
})

theme.resolve({ role: "text.secondary", usage: "text", context: "dark", surface: "surface", emphasis: "subtle" })

theme.resolve({ role: "text.disabled", usage: "text", context: "light", surface: "surface", contrast: { model: "apca", targetLc: 45 } })
```

### Links

```ts
theme.resolve({ role: "text.link", variant: "accent", usage: "text", context: "light", surface: "surface", contrast: { model: "apca", targetLc: 60 } })
```

### Botões (solid/ghost/outline/destructive/disabled)

Solid:

```ts
const base = { role: "action.primary", usage: "bg", surface: "solid", context: "light" } as const;

theme.resolve({ ...base, state: "default" })
theme.resolve({ ...base, state: "hover" })
theme.resolve({ ...base, state: "active" })
```

onSolid (texto translúcido):

```ts
theme.onSolid({ bgRole: "action.primary", usage: "text", context: "light", alpha: { mode: "fixed", alpha: 0.92 } })

theme.onSolid({ bgRole: "action.primary", usage: "icon", context: "light", alpha: { mode: "fixed", alpha: 0.72 } })
```

Ghost hover tint:

```ts
theme.resolve({ role: "action.ghost", variant: "accent", usage: "bg", context: "light", surface: "transparent", state: "hover", alpha: { mode: "fixed", alpha: 0.12 } })
```

Destructive:

```ts
theme.resolve({ role: "action.destructive", variant: "danger", usage: "bg", surface: "solid", context: "dark" })
```

### Inputs

```ts
theme.resolve({ role: "field.bg", usage: "bg", context: "light", surface: "surface" })

theme.resolve({ role: "field.border", usage: "border", context: "light", surface: "surface" })

theme.resolve({ role: "field.placeholder", usage: "text", context: "light", surface: "surface", emphasis: "muted" })
```

### Focus ring

```ts
theme.resolve({ role: "focus.ring", variant: "accent", usage: "ring", context: "dark", surface: "surface", contrast: { model: "apca", targetLc: 45 } })
```

### Alerts/Toasts

```ts
theme.resolve({ role: "toast.bg", variant: "success", usage: "bg", surface: "solid", context: "dark" })

theme.onSolid({ bgRole: "toast.bg", usage: "text", context: "dark", contrast: { model: "apca", targetLc: 70 } })
```

### Badges/chips por categoria

```ts
theme.resolve({ role: "chip.bg", variant: "category:food", usage: "bg", surface: "subtle", context: "light" })

theme.resolve({ role: "chip.text", variant: "category:food", usage: "text", context: "light", contrast: { model: "apca", targetLc: 60 } })
```

### Overlays

```ts
theme.resolve({ role: "overlay.scrim", usage: "bg", surface: "overlay", context: "dark", alpha: { mode: "fixed", alpha: 0.55 } })

theme.resolve({ role: "overlay.surface", usage: "bg", surface: "overlay", context: "dark" })
```

### Charts

```ts
theme.resolve({ role: "chart.series", variant: "chart:income", usage: "stroke", context: "light", surface: "data", output: { preferSpace: "p3", gamutMapping: "preferP3ThenCompress" } })

theme.resolve({ role: "chart.seriesFill", variant: "chart:income", usage: "fill", context: "light", surface: "data", alpha: { mode: "fixed", alpha: 0.18 } })
```

### Data-driven

**[ASSUNÇÃO]**

```ts
theme.data.resolve({ role: "data.heat", variant: "accent", value: 0.73, context: "light" })
```

### Inversão local

```ts
const bannerBg = theme.resolve({ role: "banner.bg", variant: "neutral", usage: "bg", surface: "solid", context: "light" })
const bannerText = theme.onSolid({ bgRole: "banner.bg", usage: "text", context: "light" })
```

### High contrast

```ts
const hc = theme.withContext("highContrast")
hc.color("text.primary")
```

---

## 8. Inputs do usuário (como configurar a lib)

### Config mínima (inputs)

- mínimo clássico: `accent`, `neutral`, `background`
- evolução: **seed única**

### Seed única

**[ASSUNÇÃO]**: seed única gera família accent; neutral/background vêm de perfil do tema.

### Complementares

- `category:*` e `chart:*` com seeds próprias.

---

## 9. Algoritmo de geração (como construir o motor)

1. parsing hex → OKLCH
2. gerar escala 12 steps (curvas L/C, H estável)
3. gamut mapping
4. operadores state/emphasis/alpha
5. contraste + solver
6. onSolid
7. exporters

---

## 10. Dependências recomendadas (bibliotecas)

- principal: `culori`
- alternativa: `colorjs.io`
- evitar: libs sem OKLCH nativo

Arquitetura: adapter + engine + contrast + exporters.

---

## 11. Roadmap de implementação (pés no chão)

### MVP

- resolve/color/withContext
- presets básicos
- css vars (srgb + oklch)

### v1

- gamut-safe robusto
- onSolid completo
- meta/diagnostics

### vNext

- data-driven value
- perfis highContrast
- tooling (CLI/types/validators)

---

## 12. Apêndices

### Glossário

- gamut, clipping, compressão de chroma, OKLCH, APCA, progressive enhancement

### Defaults

**[ASSUNÇÃO]** targets iniciais APCA por usage.

### Checklist QA

- light/dark
- contraste texto/ícone
- focus ring
- charts distinguíveis

---

## Checklist decisório — DECISÕES FECHADAS (congeladas)

> Esta seção consolida **todas as decisões tomadas**. A SPEC passa a ser considerada **fechada para implementação da v1**, com caminhos claros para vNext.

As escolhas abaixo **substituem** qualquer [ASSUNÇÃO] anterior.

---

### A. Contraste e acessibilidade (APCA/WCAG2)

- **A1 — Source of truth:** APCA-first, com fallback WCAG2 quando necessário.
- **A2 — Targets:** definidos já na v1 por `usage + emphasis`, com extensão futura para `textSize` e `weight`.
- **A3 — Mapa usage + emphasis:** adotado como regra padrão.
- **A4 — Solver:** `on` vira padrão implícito em componentes; quando ausente, usar heurística baseada em `surface`.
- **A5 — Parâmetros do solver:** ajusta `L` primeiro, depois `C`. `H` permanece estável.
- **A6 — Falha do solver:** best-effort por default, com `strict:true` opcional em `OutputOptions`.

---

### B. Escalas e curvas (L/C/H)

- **B1 — Curvas L:** paramétricas (não cópia literal do Radix), mantendo preset `radix-like-ui` para compatibilidade.
- **B2 — Curvas C:** função de L + limites por hue/família.
- **B3 — Hue:** estável; micro-ajuste apenas durante gamut mapping.
- **B4 — Presets:** `modern` como default; `radix-like-ui` como preset legado.

---

### C. Estados e operadores

- **C1 — Hover/active:** light → escurece levemente; dark → clareia levemente.
- **C2 — States v1:** `default | hover | active | disabled | selected | focus`.
- **C3 — Operadores por surface:** obrigatório (resolve bgActive vs solidBg).
- **C4 — Disabled:** redução de C + ajuste de L (alpha apenas complementar).
- **C5 — Selected:** curva própria, menos agressiva que active.

---

### D. Transparência / Alpha

- **D1 — onSolid:** alpha fixo validado (text ≈ 0.92, icon ≈ 0.72); sobe para 1.0 se falhar contraste.
- **D2 — solveOnBackground:** ajusta L/C antes de mexer em alpha.
- **D3 — Onde alpha é permitido:** overlay, ghost, onSolid e data fill.

---

### E. Gamut, P3 e serialização

- **E1 — Estratégia:** híbrida — default OKLCH; `display-p3` opt-in via `OutputOptions`.
- **E2 — Gamut mapping:** `preferP3ThenCompress` como default.
- **E3 — Ordem:** hex → oklch → display-p3.
- **E4 — Precisão:** 3 casas em C, 1 em L e H (configurável).

---

### F. Inputs do usuário

- **F1 — Seed única:** híbrido — gera accent; neutral/background podem ser derivados ou fornecidos.
- **F2 — Mínimo obrigatório:** `neutral + accent`; `background` derivado por default.
- **F3 — Background:** branco/preto por contexto como default; tintado como preset opcional.
- **F4 — Complementares (category/chart):** auto-geradas com possibilidade de override por seed.
- **F5 — Roles tipadas:** geração via CLI (mantendo string livre em runtime).

---

### G. API e tipos TS

- **G1 — ColorRole:** string livre + union opcional via codegen.
- **G2 — theme.color:** aceita subset validado de `ColorQuery`.
- **G3 — BackgroundHint (****************on****************):** opcional, mas recomendado; solver completo só com `on`.
- **G4 — OutputOptions:** incluem `strict` e `precision`.
- **G5 — Accessors tipados:** vNext (via codegen).

---

### H. Exporters

- **H1 — CSS vars:** naming compatível (`--pk-*`), com opção de prefix/scheme.
- **H2 — States:** export híbrido — preset decide (CSS exporta; runtime resolve).
- **H3 — JSON:** estruturado por contexto (`light` / `dark`).

---

### I. Data-driven

- **I1 — API:** `theme.data.resolve({ value })`.
- **I2 — Mapeamento:** L + C, garantindo monotonicidade em L.
- **I3 — Acessibilidade:** solver obrigatório para labels/axis/grid.

---

### J. Validação e robustez

- **J1 — Entrada inválida:** erro com mensagem clara (best-effort só com `strict:false`).
- **J2 — Strict mode:** opcional.
- **J3 — Meta/debug:** opcional via flag `includeMeta`.

---

## STATUS FINAL

✅ **SPEC FECHADA PARA IMPLEMENTAÇÃO DA V1**

Abaixo está o **Implementation Plan v1**, que transforma a SPEC em um plano técnico executável.

---

## Implementation Plan v1

> Objetivo: permitir implementar a Palette Kit **sem decisões pendentes**, em ordem incremental, com PRs pequenos e verificáveis.

---

## Fase 0 — Preparação e alinhamento (sem lógica de cor)

### 0.1 Estrutura de pastas

```text
  /src
    /core
    /engine
    /contrast
    /operators
    /export
    /presets
    /types
    /utils
```

**Responsabilidades:**

- `core`: API pública (`createTheme`, `theme.resolve`, etc.)
- `engine`: resolução semântica → cor base
- `contrast`: APCA/WCAG2 + solver
- `operators`: state/emphasis/alpha
- `export`: css/json
- `presets`: curvas, defaults, radix-like
- `types`: contratos TS públicos
- `utils`: parsing, clamp, math

### 0.2 Dependências

- `culori` (obrigatória)
- `apca-w3`

---

## Fase 1 — Tipos e contratos (fundação)

### 1.1 Tipos públicos (src/types)

Implementar **sem lógica**:

- `ColorContext`
- `SurfaceIntent`
- `ColorState`
- `ColorEmphasis`
- `SemanticVariant`
- `ColorUsage`
- `ColorRole`
- `BackgroundHint`
- `ContrastRequirement`
- `AlphaStrategy`
- `OutputOptions`
- `ColorQuery`
- `OnSolidQuery`
- `ResolvedColor`
- `ColorMeta`

Critério de aceite:

- build passa
- nenhum import circular

---

## Fase 2 — Parsing e normalização

### 2.1 Parser de entrada

Arquivo: `utils/parseColor.ts`

- hex → RGB
- RGB → OKLCH
- preservar alpha

### 2.2 Normalização

Arquivo: `engine/normalize.ts`

- clamp L/C/H
- defaults de contexto
- validações básicas

Critério de aceite:

- qualquer hex válido vira OKLCH válido

---

## Fase 3 — Escalas base (sem estado)

### 3.1 Curvas de L e C

Arquivo: `presets/curves.ts`

- `modern`
- `radixLike`

### 3.2 Gerador de escala

Arquivo: `engine/generateScale.ts`

Input:

- seed OKLCH
- surface
- context

Output:

- steps 1–12 (OKLCH)

Critério de aceite:

- monotonicidade de L
- C dentro do gamut após compressão

---

## Fase 4 — Resolução semântica base

### 4.1 Resolver principal

Arquivo: `engine/resolveBaseColor.ts`

Responsável por:

- role + variant → seed
- surface + usage → faixa da escala

Sem estado ainda.

### 4.2 theme.resolve (parcial)

Arquivo: `core/resolve.ts`

- retorna cor default (sem hover/active)

Critério de aceite:

- exemplos simples funcionam

---

## Fase 5 — Operadores de estado e ênfase

### 5.1 State operators

Arquivo: `operators/state.ts`

- hover
- active
- selected
- disabled
- focus

### 5.2 Emphasis operators

Arquivo: `operators/emphasis.ts`

- muted
- subtle
- strong
- inverted

Critério de aceite:

- alterações previsíveis em L/C

---

## Fase 6 — Contraste e solver

### 6.1 APCA wrapper

Arquivo: `contrast/apca.ts`

- calcular Lc
- fallback WCAG2

### 6.2 Solver

Arquivo: `contrast/solver.ts`

Algoritmo:

1. ajustar L
2. ajustar C
3. falha controlada

Respeitar:

- `strict`
- `ContrastRequirement`

---

## Fase 7 — onSolid

Arquivo: `engine/onSolid.ts`

- escolher branco/preto automaticamente
- aplicar alpha
- validar contraste

---

## Fase 8 — Gamut e serialização

Nota v1: consistência de epsilon + strict + utilities internas.

### 8.1 Gamut mapping

Arquivo: `engine/gamut.ts`

- compressChroma
- preferP3ThenCompress

### 8.2 Serialização

Arquivo: `export/serializeColor.ts`

- hex
- oklch()
- color(display-p3)

---

## Fase 9 — Exporters

### 9.1 CSS Vars

Arquivo: `export/cssVars.ts`

- fallback + @supports
- prefix configurável

### 9.2 JSON

Arquivo: `export/json.ts`

---

## Fase 10 — API final

### 10.1 createTheme

Arquivo: `core/createTheme.ts`

- injeta presets
- retorna `SemanticColorTheme`

### 10.2 Métodos finais

- `resolve`
- `resolveMany`
- `color`
- `onSolid`
- `withContext`

---

## Fase 11 — QA mínimo v1

Checklist:

- light/dark
- texto primário/secundário
- botão solid + onSolid
- focus ring
- overlay

---

## Resultado esperado da v1

- API estável
- compatível com versão atual
- base sólida para vNext

---

Próximo passo natural:

➡️ **codificação guiada** começando pela Fase 1
