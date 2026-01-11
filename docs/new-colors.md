# Documento: algoritmo “single-color” para gerar escala Radix-like

## Objetivo

Gerar uma **escala de 12 steps (light + dark)** para uma cor arbitrária `seed`, de forma compatível com Radix:

* steps 1–2: fundos
* 3–5: backgrounds de componentes
* 6–8: bordas/focus
* 9–10: sólidos
* 11–12: texto acessível

## Escopo

* O usuário fornece **apenas 1 cor** (`seed`)
* O pacote produz **somente a escala dessa cor** (accent/custom scale)
* O resto da paleta (neutral/bg) continua vindo do Radix padrão do app

---

## 1) API proposta

```ts
generateRadixLikeScale({
  seed: "#FF3EA5",
  mode: "both", // "light" | "dark" | "both"
  anchorStep: 9, // default 9
  background: "auto", // ou "#FFFFFF"/"#111111" opcional
})
```

**Observação importante:** mesmo “single-color”, permitir `background` opcional ajuda a gerar alphas melhores. Mas o *happy path* não exige.

---

## 2) Estratégia geral (o motor)

## 2.1 Trabalhar em OKLCH

Converter `seed` para `OKLCH(L,C,H)`.

## 2.2 Escolher um template Radix por Hue

Selecionar o template mais próximo em matiz (Hue) usando os templates oficiais Radix:

* `blue`, `indigo`, `violet`, `crimson`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `teal`, `cyan`, `sky`, `mint`, etc.
* e suas versões `Dark`

**Critério:** menor distância angular entre `H_seed` e `H_template(step 9)`.

## 2.3 Ancorar o seed no step 9 (ou 10)

Ajustar o template para que:

* `new[anchorStep] ≈ seed`

Isso define o delta:

* `dL, dC, dH` entre `seed` e `template[anchorStep]`

## 2.4 Aplicar delta nos 12 steps com curvas

Para cada step i:

```text
L_i = templateL_i + curveL(i)*dL
C_i = templateC_i + curveC(i)*dC
H_i = templateH_i + dH
```

Curvas recomendadas (v1):

* `curveL`: baixa influência em 1–2, moderada em 3–5, alta em 6–8, total em 9–12
* `curveC`: reduz chroma nos extremos (1–2 e 11–12)

Resultado: preserva a “personalidade Radix” (os steps continuam servindo para os mesmos usos).

## 2.5 Clamp + gamut safety

Converter OKLCH → sRGB (hex).
Se “clipping” ocorrer, reduzir `C` progressivamente até entrar no gamut.

---

## 3) Como gerar Light e Dark com 1 cor

### Opção A (recomendada): rodar duas vezes com templates distintos

* Light: usar template “normal”
* Dark: usar template “Dark”

Mesmo seed, mas com bases diferentes.
Isso mantém o comportamento de contraste esperado no dark mode.

### Opção B (fallback): inverter curva de L

Só se você não quiser carregar templates dark. Não recomendo.

---

## 4) Background/Gray: como lidar sem pedir do usuário

Você não precisa gerar `gray` nem `bg` com esse algoritmo.
A proposta do produto é:

* **O app já tem neutral/bg do Radix padrão** (Slate/Gray etc.)
* Esse gerador serve para criar **cores complementares** (category colors, chart colors, premium, info…)

Então o output é só:

* `customScaleLight[1..12]`
* `customScaleDark[1..12]`

O usuário encaixa isso no seu sistema:

```ts
scales: {
  neutral: "slate",
  accent: "indigo",
  category3: generateRadixLikeScale({ seed: "#FF3EA5" }),
}
```

---

## 5) Texto sobre solid (whiteAlpha vs blackAlpha) com 1 cor

Sem background explícito, dá pra decidir usando o próprio step 9.

Regra v1:

* compute luminância/OKLCH L do `step9` no modo atual
* se `L(step9) > 70` → usar `blackAlpha`
* senão → `whiteAlpha`

E usar as opacidades padrão:

* primary 0.92
* secondary 0.72
* disabled 0.48

Isso garante o efeito “texto translúcido” que você gosta, sem input extra.

---

## 6) Alpha scale (a1..a12) — opcional, mas valioso

Para gerar alphas “de verdade”, você precisa de um background.
Como o usuário não fornece, use defaults:

* Light background default: `#FFFFFF`
* Dark background default: `#111111`

E então resolva alpha por step para que:
`blend(background, rgba(seed-ish), alpha) ≈ step_i`

Se você quiser manter mais aderente ao Radix:

* alpha scales podem ser calculadas com o “target” sendo o próprio step_i.

Mas isso é **v2**. O MVP pode entregar só os steps sólidos (hex) e o `onSolid` alpha (white/black).

---

## 7) Garantias e limites (honestidade técnica)

Com entrada única:

* você gera uma escala **bem consistente** para UI
* mas não dá para “otimizar” para um background específico do usuário sem ele informar

Por isso, o design do produto deve posicionar essa feature como:

> “gerador de escalas complementares para adicionar ao sistema Radix existente”.

---

## 8) Plano incremental de implementação (Codex)

### Sprint 1

* OKLCH conversion
* template selection por hue
* anchor step 9
* gerar steps 1..12 light

### Sprint 2

* dark templates + gerar dark

### Sprint 3

* gamut safety (redução de chroma)
* testes snapshot

### Sprint 4

* onSolid auto (white/black alpha)
* output tipado + integração com pacote principal

### Sprint 5 (opcional)

* alpha scale a1..a12 usando background default (ou informado)
