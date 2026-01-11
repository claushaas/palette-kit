# Palette Kit

## 0) Visão geral

### O problema real

Um design system moderno precisa de cores que sejam:

* **Perceptualmente consistentes** (a escala “sobe” de forma suave aos olhos, não no RGB)
* **Semânticas** (cada step tem um uso claro: background, surface, border, solid, text)
* **Acessíveis** (texto realmente legível, com contraste adequado no contexto)
* **Reprodutíveis** (mesma seed → mesma paleta)
* **Extensíveis** (categorias, charts, badges, estados custom)
* **Compatíveis com o mundo atual** (sRGB e Display-P3, dark mode sério, tokens exportáveis)

Radix é ótimo como *modelo de UX e ergonomia*, mas o motor pode ser modernizado.

### A proposta

Criar uma biblioteca que:

1. Recebe uma **cor seed** (uma só) para gerar escalas complementares “Radix-like” (12 steps)
2. Opcionalmente recebe mais seeds (neutro, background etc.) para geração mais controlada
3. Gera light/dark, alphas, e tokens por intenção
4. Usa **OKLCH** para geração e **APCA (WCAG 3)** para resolver contraste (com fallback)

**Resultado:** um “Radix-like 2025” — sem dogma, com matemática boa e UX prática.

---

## 1) Princípios (as leis do reino)

### 1.1 Tokens por intenção, não por cor

O consumidor do pacote deveria usar:

* `bg.app`
* `surface.card`
* `border.subtle`
* `accent.solid`
* `text.primary`

E **nunca**: `blue9`, `purple11` diretamente.

### 1.2 A escala tem semântica fixa

Manter a ideia de 12 steps porque é um ótimo “mapa mental”:

* **1–2**: backgrounds
* **3–5**: component backgrounds (default/hover/active)
* **6–8**: borders/focus
* **9–10**: solid backgrounds (default/hover)
* **11–12**: text (secondary/primary)

Isso é ouro operacional. A inovação entra no motor.

### 1.3 Geração em espaço perceptual (OKLCH)

A escala nasce em **OKLCH**, e só no final é convertida para sRGB/P3.

### 1.4 Contraste é resolvido, não chutado

Principal modernização: texto (e às vezes borders) deve ser **resultado de um solver de contraste**, não de um “L=tal”.

### 1.5 Gamut é realidade, não detalhe

Muitas cores lindas em OKLCH não cabem em sRGB. O sistema precisa de estratégia:

* clip (pior)
* compress (melhor)
* ou oferecer **Display-P3** quando disponível

---

## 2) Glossário (pra humanos e AIs falarem a mesma língua)

* **Seed**: cor inicial fornecida pelo usuário (ex.: `#FF3EA5`)
* **Scale**: conjunto de 12 cores para uma família (accent, category, etc.)
* **Step**: índice de 1 a 12 dentro de uma scale
* **Role**: token semântico consumido pelo app (ex.: `cta.bg`)
* **OKLCH**: espaço perceptual com Lightness (L), Chroma (C), Hue (H)
* **APCA**: métrica moderna de contraste perceptual (WCAG 3)
* **Gamut**: conjunto de cores que um dispositivo/espaco suporta (sRGB vs Display-P3)
* **Alpha scale**: steps com transparência para overlays/textos

---

## 3) “Radix-like 2025”: arquitetura da biblioteca

### 3.1 Módulos principais

#### (A) Engine (core)

* Converte cores para OKLCH
* Gera 12 steps para light e dark
* Aplica curvas, heurísticas e gamut mapping

#### (B) Contrast Solver

* Dado (foreground candidate, background) → ajusta até atingir alvo APCA
* Preferencialmente opera em OKLCH (ajustando L e/ou C)

#### (C) Alpha Generator

* Gera versões alpha úteis (overlays) com base no background do tema (ou defaults)

#### (D) Token Composer

* Mapeia scales → roles (bg/surface/border/text/solid)
* Aplica overrides
* Exporta em formatos: TS/JSON/CSS vars/Tailwind/RN

#### (E) Validation & Diagnostics

* Relatórios: contrast scores, gamut clipping, warnings
* Modo “strict” (erro) e “soft” (warn)

---

## 4) Interfaces públicas (API do pacote)

### 4.1 Geração “single-color” (o seu caso principal)

Para complementar Radix (categorias, charts, badges etc.)

```ts
generateScale({
  seed: "#FF3EA5",
  mode: "both", // light+dark
  model: "oklch-apca", // engine
  intent: "accent", // ou category/chart
})
```

Retorna:

* `scale.light.steps[1..12]`
* `scale.dark.steps[1..12]`
* `scale.meta` (diagnósticos)

### 4.2 Composição de tema completo (opcional)

Para apps que querem tudo gerado:

```ts
createTheme({
  neutral: { source: "radix", name: "slate" },   // ou seed custom
  accent:  { source: "seed", value: "#3D63DD" },
  semantic: {
    success: { source: "radix", name: "green" },
    warning: { source: "seed", value: "#F5B400" },
    danger:  { source: "radix", name: "red" },
  },
  extras: {
    category1: { source: "seed", value: "#FF3EA5" },
    chart1:    { source: "seed", value: "#00C2FF" },
  },
  tokens: { preset: "radix-like-ui" },
  output: { cssVars: true, prefix: "bp" }
})
```

### 4.3 Exportadores

* `toCssVars(theme, { prefix })`
* `toJson(theme)`
* `toTailwind(theme)`
* `toReactNative(theme)`

---

## 5) O motor de geração de escala (OKLCH + templates + curvas)

### 5.1 Por que templates ainda importam

Material You prova que dá para gerar tudo de uma seed, mas UI “de verdade” gosta de previsibilidade.

Templates te dão:

* “forma” de escala já comprovada (onde chroma cresce, onde cai)
* consistência entre cores diferentes
* um ponto de partida bom para dark mode

**Plano:** manter um catálogo de templates (pode ser inspirado no Radix, mas convertido para OKLCH).

### 5.2 Escolha de template por Hue

* Converter seed → OKLCH
* Escolher o template com hue mais próximo (distância angular)

Isso evita que um rosa seed caia num template “verde” e vire Frankenstein cromático.

### 5.3 Step âncora (default: 9)

* Step 9 representa “solid”
* Fazer `seed ≈ step9` é intuitivo: “a cor que escolhi é a cor do botão sólido”

### 5.4 Delta e aplicação

Você calcula o delta entre seed e template[9]:

* `dL = L_seed - L_t9`
* `dC = C_seed - C_t9`
* `dH = H_seed - H_t9`

E aplica nos 12 steps, mas com **curvas por faixa**.

### 5.5 Curvas (o molho Radix-like)

A escala não é linear. Ela é um conjunto de compromissos:

* Steps 1–2 precisam ser “respeitosos” com backgrounds
* Steps 11–12 precisam existir para texto, não para “ficar bonito no swatch”

Uma versão inicial (v1) de curvas, pragmática e boa:

#### Curva de Lightness (quanto aplicar dL por step)

* 1–2: 0.25–0.35
* 3–5: 0.55–0.70
* 6–8: 0.75–0.90
* 9–12: 1.00

#### Curva de Chroma

* 1–2: 0.15–0.25
* 3–5: 0.50–0.70
* 6–8: 0.70–0.90
* 9–10: 1.00
* 11–12: 0.60–0.80 (reduzir chroma para texto)

#### Hue

* aplicar `dH` inteiro, mas com opção de “hue lock” nos extremos (para evitar viradas estranhas em muito claro/escuro)

### 5.6 Dark mode: não inventar, usar templates dark

Repete tudo com templates dark.
Isso tende a gerar “dark mode com cara de produto”, não “inversão de planilha”.

---

## 6) A modernização real: Contrast Solver (APCA-first)

### 6.1 Por que APCA

Contraste WCAG 2 (ratio) é útil, mas frequentemente falha em prever legibilidade real — especialmente em dark mode e texto fino.

APCA é um modelo perceptual mais moderno. A grande ideia:

* texto escuro em fundo claro ≠ texto claro em fundo escuro
* tamanho, peso e polaridade importam

### 6.2 Onde o solver deve ser aplicado

Você não precisa “solver tudo” (isso vira pesado). Foque nos tokens críticos:

* `text.primary` (step 12)
* `text.secondary` (step 11)
* `onSolid.text` (texto em step 9/10)
* `link`/`accentText` se existir
* possivelmente `focusRing` (para visibilidade mínima)

### 6.3 Como o solver funciona (conceito)

Dado:

* background (ex.: `bg.app`)
* um candidato de foreground (ex.: `scale[12]`)

O solver ajusta (em OKLCH) até bater um alvo.

Ajustes permitidos (ordem sugerida):

1. variar **Lightness (L)** primeiro (impacta legibilidade mais)
2. se gamut estourar ou ficar feio, reduzir **Chroma (C)**
3. hue raramente precisa mudar para legibilidade (evitar)

### 6.4 Alvos recomendados (inicial)

Sem tentar ser polícia de acessibilidade ainda, você define metas de produto:

* `text.primary` → APCA ~ **Lc 75–90** (depende do tamanho)
* `text.secondary` → **Lc 55–70**
* `onSolid.primary` → **Lc 60–75** (porque em botão é comum fonte menor)
* `disabled` → não é sobre “passar contraste”, é sobre parecer desabilitado (mas ainda legível se necessário)

A lib pode oferecer presets:

* `contrastProfile: "standard" | "strict" | "relaxed"`

### 6.5 Fallback (mundo real)

APCA ainda não é “onipresente”. Então:

* engine usa APCA se disponível
* fallback para WCAG2 ratio (ou heurística de L)

---

## 7) Texto sobre solid: substituir a lista “yellow/amber/lime…” por decisão objetiva

Em vez de “essas escalas usam texto preto”, faça:

1. calcule contraste do step9 com **branco** e com **preto**
2. escolha o melhor (ou o que atinge target com menor ajuste)
3. aplique alpha (0.92/0.72/0.48) ou resolva alpha para bater um target APCA

Isso elimina:

* listas hardcoded
* exceções surpreendentes
* bugs quando o seed é “amarelo-que-não-é-amarelo”

---

## 8) Alpha scales (a1..a12): do “bonitinho” ao útil

### 8.1 O que alpha scale deve representar

Alpha scale é especialmente útil para:

* overlays suaves
* backgrounds de hover/active quando o componente é “ghost”
* text tint sem criar novos hex

### 8.2 Sem background informado?

No modo single-color, use defaults:

* light: `#FFFFFF`
* dark: `#111111`

E gere alphas “boas o suficiente”.

### 8.3 Com background do tema?

Melhora bastante: alpha scale pode ser resolvida para o background real do tema.

---

## 9) Gamut e Display-P3 (o mundo moderno mora aqui)

### 9.1 Por que isso importa

OKLCH permite cores bem saturadas que simplesmente não cabem em sRGB.
Se você só “clippa”, fica feio e inconsistente.

### 9.2 Estratégia recomendada (v1)

* gerar em OKLCH
* converter para sRGB
* se fora do gamut: reduzir C até caber (compressão simples)

### 9.3 Estratégia recomendada (v2)

* oferecer duas saídas:
  * `steps.srgb`
  * `steps.p3`
* exportar CSS com `color(display-p3 ...)` quando suportado

Isso é “mirar nas estrelas” com o pé no chão: v1 já funciona; v2 dá o brilho premium.

---

## 10) Tokens: o “preset radix-like-ui” do seu pacote

### 10.1 Preset de roles (mínimo moderno)

* `bg.app` → neutral 1
* `bg.subtle` → neutral 2
* `surface.card` → neutral 2
* `surface.raised` → neutral 3
* `component.bg` → neutral 3
* `component.bgHover` → neutral 4
* `component.bgActive` → neutral 5
* `border.subtle` → neutral 6
* `border.default` → neutral 7
* `focus.ring` → accent 8
* `accent.solid` → accent 9
* `accent.solidHover` → accent 10
* `text.secondary` → neutral 11 (solver pode ajustar)
* `text.primary` → neutral 12 (solver pode ajustar)
* `onSolid.textPrimary` → solver escolhe white/black (+ alpha)

### 10.2 Extras (categorias/charts)

* `category.n.solid` → categoryN 9
* `category.n.subtle` → categoryN 3
* `chart.n.line` → chartN 9
* `chart.n.fill` → chartN 9 + alpha

---

## 11) Diagnósticos e “modo engenheiro”

A lib vai ser boa mesmo se ajudar a evitar armadilhas.

### Relatório de qualidade por scale

* steps fora do gamut (count)
* contraste de tokens críticos (score APCA/WCAG)
* aviso de “low chroma” (seed muito cinza)
* aviso de “seed muito escura” (dá solid ruim em light)

### API de diagnóstico

* `analyzeScale(scale, { background })`
* `analyzeTheme(theme)`

---

## 12) Plano incremental (execução com pés no chão)

### Sprint 0 — Infra

* TS build (tsup)
* testes (vitest/jest)
* conversões de cor (OKLCH): escolher lib ou implementar
* estrutura de pacotes e exports

### Sprint 1 — Single-color scale (light)

* template selection por hue
* anchor step 9
* curvas v1 (L/C)
* gamut compress simples
* output `steps[1..12]` em hex

### Sprint 2 — Dark mode

* templates dark
* geração paralela light/dark

### Sprint 3 — OnSolid automático

* decidir white vs black por contraste
* aplicar alpha padrão

### Sprint 4 — Contrast solver (APCA)

* integrar APCA (ou fallback)
* solver para `text 11/12` e `onSolid`

### Sprint 5 — Alpha scale

* gerar a1..a12 com background default
* opcional: permitir background custom

### Sprint 6 — Token composer + exporters

* preset `radix-like-ui`
* exports TS/JSON/CSS vars
* integração com RN/Tailwind (opcional)

### Sprint 7 — QA visual

* gerar páginas de preview (story) com componentes
* testes snapshot visuais (Playwright, por exemplo)

---

## 13) O que torna essa biblioteca “muito legal” (o diferencial de verdade)

1. **Entrada simples (1 cor)**, mas resultado sério (12 steps + dark + onSolid)
2. **Semântica de UI** preservada (aprendizado baixo)
3. **Contraste resolvido**, não “esperado”
4. **Diagnósticos** que evitam paletas “bonitas e inúteis”
5. Caminho claro para **P3** e “modo premium” sem quebrar o MVP

---

## 14) Próximo artefato (para começar a codar sem tropeçar)

O próximo documento ideal (bem codex-friendly) é um **spec de implementação** com:

* estrutura de arquivos
* tipos TS (Scale, Step, Theme, Role)
* assinatura final das funções
* pseudo-código do gerador v1
* lista inicial de templates (podemos extrair das paletas existentes e converter para OKLCH)

Se você quiser, eu já escrevo esse spec como “Sprint 0–2 pronto para implementação”, com checklist por arquivo e testes esperados — e aí vocês começam a biblioteca amanhã com confiança, não com fé.
