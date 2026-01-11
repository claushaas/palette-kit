# Palette Kit

Gerador de paletas modernas (OKLCH + APCA) com steps Radix-like. A biblioteca aceita seeds (cores iniciais) e entrega scales light/dark, tokens semanticos e exportadores prontos para uso.

Status: WIP. A API pode mudar enquanto o MVP estiver em construcao.

## Instalacao

```bash
npm install @claus/palette-kit
```

```bash
yarn add @claus/palette-kit
```

```bash
pnpm add @claus/palette-kit
```

## O que a biblioteca entrega

- Scale com 12 steps (light/dark) a partir de uma seed.
- Tokens semanticos prontos para UI (preset `radix-like-ui`).
- Alpha scale util para overlays.
- Exporters em TS, JSON e CSS vars.
- Diagnosticos basicos de contraste e gamut.

## Exemplo de uso (API planejada)

```ts
import { createTheme } from "@claus/palette-kit";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  semantic: {
    success: { source: "seed", value: "#16a34a" },
    warning: { source: "seed", value: "#f59e0b" },
    danger: { source: "seed", value: "#ef4444" },
  },
  tokens: { preset: "radix-like-ui" },
  output: { format: "css", cssVarPrefix: "pk" },
});
```

## Principios

- Tokens por intencao, nao por cor.
- Steps fixos (1-12) para consistencia de UI.
- Geracao em OKLCH, contraste resolvido com APCA.

## Documentacao e planos

- `docs/Why.md`
- `docs/spec-implementation.md`
- `docs/plan-tests.md`
- `docs/plan-docs.md`

## Roadmap curto

1) Gerar scales a partir de seed (light/dark).
2) Tokens e exporters basicos.
3) Contraste e alpha scale.

## Licenca

MIT
