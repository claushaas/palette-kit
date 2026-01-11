# Documentação de criação do pacote de paleta (Radix Colors → tokens prontos)

## Objetivo

Criar um pacote (biblioteca) que permita **escolher escalas de cor do Radix** (ex.: `slate`, `indigo`, `green`) e gerar automaticamente uma **paleta padronizada** para **tema claro e escuro**, com:

* **Tokens por intenção (roles)**, não por “nome de cor”
* Suporte ao seu estilo favorito: **componentes com `solidBG` (steps 9–10)** e **texto translúcido** (white/black alpha) “da mesma vibe”
* Extensibilidade para **cores extras** (categorias, gráficos, premium, info, etc.)
* Saídas em múltiplos formatos: **TypeScript**, **JSON**, **CSS variables**, e (opcional) preset Tailwind / objeto React Native

A meta é que **um dev humano** consiga implementar passo a passo, e **uma AI (Codex)** consiga seguir como plano de execução incremental.

---

## Visão do sistema

### Conceitos-chave

1. **Scale (escala)**
   Uma escala do Radix (ex.: `slate`, `indigo`, `green`) contém valores para **steps 1–12** e também variações alfa (se você usar Radix alpha scales, opcional).

2. **Slot**
   Um “apelido” funcional para uma escala dentro do tema, ex.:

* `neutral`, `accent`, `success`, `warning`, `danger`
* extras: `info`, `highlight`, `premium`, `category1..categoryN`, `chart1..chartN`

3. **Role (token semântico)**
   Um token de intenção consumido pelo app, ex.:

* `bg.app`, `surface.card`, `text.primary`
* `cta.bg`, `cta.bgHover`, `focus.ring`
* `toast.success.bg`, `badge.premium.bg`

4. **Strategy (estratégia de mapeamento)**
   Define quais steps usar para cada “família”:

* surfaces: steps 1–3
* component backgrounds: steps 3–5
* borders/focus: steps 6–8
* solids: steps 9–10
* text: steps 11–12
* onSolidText: white/black alpha

---

## Requisitos funcionais

### Entrada (config)

* Definir escalas para slots (mínimo): `neutral`, `accent`, `success`, `warning`, `danger`
* Permitir extras: `info`, `highlight`, `premium`, `category*`, `chart*`
* Definir comportamento do texto sobre sólidos:

  * padrão: `whiteAlpha` com opacidades (0.92/0.72/0.48)
  * exceção: escalas “claras” devem usar `blackAlpha` (ex.: `yellow`, `amber`, `lime`, `sky`, `mint` — lista configurável)

### Saída (palette)

* `palette.light` e `palette.dark`
* tokens resolvidos em valores finais (hex/rgba/hsl, dependendo do formato escolhido)
* possibilidade de export “raw” (referência `scale+step`) e “resolved” (valor final)

---

## Requisitos não-funcionais

* **TypeScript-first**: tipos fortes para config e tokens
* **Determinístico**: mesma config → mesma paleta
* **Validável**: erro claro quando role referencia slot inexistente
* **Sem acoplamento ao runtime**: deve funcionar em Node/Build-time e em runtime
* **Baixa fricção**: defaults inteligentes (padrão Radix) e overrides pontuais

---

## Design da API

### Função principal

```ts
createPalette(config) => Palette
```

### Config mínima (baseline)

```ts
type MinimalConfig = {
  scales: {
    neutral: RadixScaleName;   // ex "slate" | "gray"
    accent: RadixScaleName;    // ex "indigo"
    success: RadixScaleName;   // ex "green"
    warning: RadixScaleName;   // ex "amber"
    danger: RadixScaleName;    // ex "red"
  };
};
```

### Config estendida (recomendada)

```ts
type ExtendedConfig = MinimalConfig & {
  scales?: MinimalConfig["scales"] & {
    info?: RadixScaleName;
    highlight?: RadixScaleName;
    premium?: RadixScaleName;
    // extras dinâmicos
    [slot: `category${number}`]: RadixScaleName;
    [slot: `chart${number}`]: RadixScaleName;
  };

  strategy?: {
    // steps padrão (podem ser sobrescritos)
    surfaces?: { appBg: 1 | 2; surface: 2 | 3; surfaceRaised: 3 | 4 };
    components?: { bg: 3 | 4; bgHover: 4 | 5; bgActive: 5 | 6 };
    borders?: { subtle: 6 | 7; interactive: 7 | 8; focus: 8 | 9 };
    solids?: { solid: 9 | 10; solidHover: 10 | 11 };
    text?: { low: 11 | 10; high: 12 | 11 };
    onSolidText?: "whiteAlpha" | "blackAlpha" | "auto";
  };

  alpha?: {
    onSolid?: { primary: number; secondary: number; disabled: number };
  };

  lightSolidTextScales?: RadixScaleName[]; // lista que força blackAlpha
  roles?: RoleMap;                         // permite adicionar roles extras
  overrides?: {
    light?: Partial<RoleMapResolved>;
    dark?: Partial<RoleMapResolved>;
  };

  output?: {
    format?: "ts" | "json" | "css";
    cssVarPrefix?: string; // ex: "bp"
  };
};
```

---

## Padrões que o pacote deve impor (as “leis do reino”)

### 1) “Um componente vive em uma escala”

Se um botão usa `accent` como sólido, **todos os tokens daquele componente** (bg, hover, border, focus, etc.) devem vir dessa mesma escala.

### 2) Mapeamento Radix recomendado

* Backgrounds: steps **1–2**
* Component BG: steps **3–5**
* Borders/focus: steps **6–8**
* Solid BG: steps **9–10**
* Text: steps **11–12**

### 3) Texto sobre solid

* Default: `rgba(255,255,255, alpha)`
* Escalas claras (ex.: yellow/amber/lime/sky/mint): `rgba(0,0,0, alpha)`
  Isso evita contraste ruim e deixa o “efeito translúcido” consistente.

---

## Catálogo inicial de roles (MVP)

### UI base (neutral)

* `bg.app` → `neutral step 1`
* `bg.subtle` → `neutral step 2`
* `surface.card` → `neutral step 2`
* `surface.raised` → `neutral step 3`
* `component.bg` → `neutral step 3`
* `component.bgHover` → `neutral step 4`
* `component.bgActive` → `neutral step 5`
* `border.subtle` → `neutral step 6`
* `border.default` → `neutral step 7`
* `text.primary` → `neutral step 12`
* `text.secondary` → `neutral step 11`
* `text.disabled` → `neutral step 10`

### Accent (CTA/ações principais)

* `cta.bg` → `accent step 9`
* `cta.bgHover` → `accent step 10`
* `cta.border` → `accent step 7`
* `cta.focusRing` → `accent step 8`

### On solid (texto/ícones sobre sólidos)

* `onSolid.primary` → white/black alpha 0.92
* `onSolid.secondary` → 0.72
* `onSolid.disabled` → 0.48

### Semânticos (success/warning/danger)

Para cada slot `success | warning | danger`:

* `status.<slot>.solidBg` → `<slot> step 9`
* `status.<slot>.solidHover` → `<slot> step 10`
* `status.<slot>.subtleBg` → `<slot> step 3`
* `status.<slot>.border` → `<slot> step 7`
* `status.<slot>.text` → `<slot> step 11`
* `status.<slot>.textStrong` → `<slot> step 12`

---

## Extensões para “cores extras” (v0.2+)

### Categorias

Slots: `category1..category12` (configurável)

Roles recomendados:

* `category.<n>.solidBg` → `category<n> step 9`
* `category.<n>.subtleBg` → `category<n> step 3`
* `category.<n>.text` → `category<n> step 11`
* `category.<n>.onSolid` → `onSolid.primary`

### Gráficos

Slots: `chart1..chart8` (configurável)

Roles:

* `chart.<n>.line` → `chart<n> step 9`
* `chart.<n>.fill` → `chart<n> step 9` + alpha (opcional)
* `chart.<n>.label` → `chart<n> step 11`

---

## Estrutura do repositório (monorepo opcional, mas recomendado)

```text
packages/
  palette/
    src/
      index.ts
      createPalette.ts
      roles/
        defaultRoles.ts
        types.ts
      scales/
        radix.ts
        types.ts
      output/
        toJson.ts
        toCssVars.ts
        toTs.ts
      validate/
        validateConfig.ts
        validateRoles.ts
      utils/
        alpha.ts
        invariant.ts
    test/
      createPalette.test.ts
    package.json
    tsconfig.json
    README.md
```

---

## Implementação incremental (plano de execução “Codex-friendly”)

### Sprint 0 — Fundamentos do projeto

**Objetivo:** pacote compila, exporta `createPalette`, testes rodam.

Checklist:

* TypeScript setup (`tsconfig`, build com `tsup` ou `rollup`)
* Jest/Vitest
* Lint (Biome/ESLint, escolha)
* `createPalette(config)` stub retornando estrutura vazia com `light/dark`

---

### Sprint 1 — Modelo de dados e validação mínima

**Objetivo:** aceitar config mínima e validar.

Implementar:

* Types: `RadixScaleName`, `SlotName`, `RoleName`
* `validateConfig`: exigir `neutral/accent/success/warning/danger`
* `invariant` com mensagens claras

Resultado:

* `createPalette` aceita config e retorna `palette.light`/`palette.dark` com tokens “raw” (ainda sem resolver cores)

---

### Sprint 2 — Roles default (MVP)

**Objetivo:** gerar o mapa default de roles.

Implementar:

* `defaultRoles.ts` com o catálogo MVP acima
* Resolver roles em “referências”: `{ slot: "neutral", step: 1 }` etc.
* Aplicar `overrides.light/dark` (se fornecido)

Resultado:

* `palette.light.roles` e `palette.dark.roles` com `{slot, step}`

---

### Sprint 3 — Resolver cores (Radix token source)

**Objetivo:** converter `{slot, step}` em valores finais.

Opções de fonte:

1. Consumir `@radix-ui/colors` como dependência e mapear:

   * `slate`, `slateDark`, etc.
2. Permitir injeção de fonte de cores (para suportar custom scales depois)

Implementar:

* `getScale(scaleName, mode)` → objeto step->valor
* `resolveRole(roleRef)` → string (hex)
* `palette.light.resolved` / `palette.dark.resolved`

---

### Sprint 4 — OnSolid text (white/black alpha + auto)

**Objetivo:** seu efeito favorito virar padrão.

Implementar:

* `onSolidTextMode = "auto"` decide white vs black alpha
* default alphas: `0.92/0.72/0.48`
* roles `onSolid.*` sempre resolvem para `rgba(...)`

Regra “auto”:

* se `accent` ∈ `lightSolidTextScales` → black alpha
* caso contrário → white alpha
  (“auto” simples e previsível; evolução futura pode calcular luminância)

---

### Sprint 5 — Exporters (JSON + CSS Vars + TS)

**Objetivo:** saída plugável.

Implementar:

* `toJson(palette)`
* `toCssVars(palette, prefix)` gera:

  * `--bp-bg-app`
  * `--bp-cta-bg`
* `toTs(palette)` opcional (ou só exportar o objeto TS)

---

### Sprint 6 — Extras: categories e charts

**Objetivo:** ampliar sem quebrar o core.

Implementar:

* suportar slots dinâmicos `categoryN`, `chartN`
* adicionar roles default opcionais quando existirem slots
* documentação de uso e exemplos

---

## Testes (mínimo necessário)

* Deve falhar se faltar slot obrigatório
* Deve gerar os roles default no light/dark
* Deve aplicar overrides
* Deve usar `whiteAlpha` por padrão e `blackAlpha` para escalas claras
* Snapshot de saída `resolved` para uma config conhecida

---

## Convenções de naming

* Roles em `kebab` ou `dot`?
  Recomendação: **dot notation** (`bg.app`, `cta.bgHover`) por ser legível e fácil de mapear para CSS vars.

Transformação para CSS vars:

* `bg.app` → `--bp-bg-app`
* `cta.bgHover` → `--bp-cta-bg-hover`

---

## Exemplo de uso (integração)

### 1) Criar paleta

```ts
const palette = createPalette({
  scales: {
    neutral: "slate",
    accent: "indigo",
    success: "green",
    warning: "amber",
    danger: "red",
    premium: "gold",
    category1: "violet",
    category2: "teal",
  },
  alpha: { onSolid: { primary: 0.92, secondary: 0.72, disabled: 0.48 } },
  lightSolidTextScales: ["yellow", "amber", "lime", "sky", "mint"],
});
```

### 2) Usar no app

* Web (CSS vars): injeta `:root { --bp-... }`
* RN: consumir `palette.light.resolved["cta.bg"]` etc.
* Tailwind: gerar config (v2 do pacote)

---

## Documentação do pacote (README mínimo)

Incluir:

* O que é slot vs role
* Config mínima e estendida
* Lista de roles default
* Como adicionar roles próprias
* Como usar overrides
* Como exportar CSS vars

---

## Roadmap opcional (depois do MVP)

* Cálculo automático de `onSolid` via luminância (mais inteligente que lista fixa)
* Geração de “cheat-sheet” em Markdown/HTML (documentação automática de tokens)
* Suporte a custom palettes (Radix Custom Palette) como input
* Plugin Tailwind oficial (gerar `theme.colors` com tokens)

---

## Critérios de pronto (Definition of Done)

O pacote é considerado “pronto” quando:

* `createPalette` gera `light/dark`
* roles default cobrem UI base + semânticos + onSolid
* validação impede configs quebradas
* existe export CSS vars e JSON
* testes cobrem casos essenciais
* README explica claramente como estender com cores extras
