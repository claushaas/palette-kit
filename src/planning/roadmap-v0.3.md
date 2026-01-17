# Palette Kit — Roadmap v0.3

> Roadmap técnico e executável para implementação da v0.3 do Palette Kit.
> Este documento transforma a SPEC v0.3 em fases claras, incrementais e verificáveis,
> com foco em DX, baixo risco e PRs pequenos.

## Objetivos da v0.3

- Tornar o Palette Kit excelente por padrão para qualquer desenvolvedor.
- Manter o core runtime-first.
- Adicionar tooling opcional (serializer, exporters, CLI, codegen).
- Garantir autocomplete total e contratos explícitos.
- Evitar big-bang refactors.

## Princípios do roadmap

- PRs pequenos e revisáveis.
- Cada fase entrega valor isoladamente.
- Nenhuma fase depende de comportamento implícito.
- DX validada a cada etapa (autocomplete + JSDoc).

## Fase 0 — Preparação (fundação)

### Fase 0 — Objetivo

Preparar a base do repositório para a v0.3 sem alterar comportamento público.

### Fase 0 — Tarefas

- [x] Criar branch `v0.3`.
- [x] Congelar v0.2 (tag + changelog).
- [x] Criar `src/planning/spec-v0.3.md`.
- [x] Criar `src/planning/roadmap-v0.3.md`.
- [x] Revisar `package.json` (exports atuais).
- [x] Garantir build limpo.

### Fase 0 — Critério de aceite

- Nenhuma mudança funcional.
- CI verde.

## Fase 1 — Serializer público (núcleo da v0.3)

### Fase 1 — Objetivo

Criar a ponte oficial entre o resolver e outputs reais (CSS/RN/JSON).

Referência: `src/planning/spec-serializer-v0.3.md`.

### Fase 1 — Entregas

- Novo módulo: `src/serialize/`.
- Funções públicas: `serializeColor`, `serializeResolved`, `theme.serialize`.

### Fase 1 — Tarefas

- [ ] Definir `ResolvedColor` público.
- [ ] Implementar serialização OKLCH.
- [ ] Implementar sRGB (hex / rgb / rgba).
- [ ] Implementar Display-P3.
- [ ] Implementar precision + strict.
- [ ] Implementar gamut mapping (`preferP3ThenCompress`).
- [ ] JSDoc completo (trade-offs + exemplos).

### Fase 1 — Critério de aceite

- Resolver continua retornando `BaseResolvedColor`.
- Serializer funciona isoladamente.
- API pública documentada.

## Fase 2 — Helpers DX no runtime

### Fase 2 — Objetivo

Reduzir boilerplate para casos comuns sem esconder o core.

### Fase 2 — Entregas

- `theme.colorCss(...)`.
- `theme.onSolidCss(...)`.
- `resolveMany(...)`.
- `withContext(...)` bound.

### Fase 2 — Tarefas

- [ ] Implementar `resolveMany`.
- [ ] Implementar tema bound por contexto.
- [ ] Adicionar helpers CSS.
- [ ] Garantir typings corretos.
- [ ] JSDoc focado em DX.

### Fase 2 — Critério de aceite

- Menos código para casos comuns.
- Zero breaking change.

## Fase 3 — Token Registry (modelo deluxe)

### Fase 3 — Objetivo

Introduzir tokens declarativos sem acoplar ao runtime.

### Fase 3 — Entregas

- Modelo de token.
- Estrutura de registry.
- Validação básica.

### Fase 3 — Tarefas

- [ ] Definir interface `TokenDefinition`.
- [ ] Definir `TokenRegistry`.
- [ ] Validar queries por token.
- [ ] Resolver tokens via `theme.resolve`.
- [ ] Garantir que tokens não carregam cor.

### Fase 3 — Critério de aceite

- Registry é puramente declarativo.
- Runtime continua independente.

## Fase 4 — Presets oficiais de tokens

### Fase 4 — Objetivo

Fornecer caminhos prontos para adoção rápida.

### Fase 4 — Presets

- `minimal-ui`.
- `radixLike-ui`.
- `modern-ui`.

### Fase 4 — Tarefas

- [ ] Definir escopo de cada preset.
- [ ] Criar tokens base.
- [ ] Definir estados suportados.
- [ ] Documentar intenção semântica.
- [ ] Testar export + runtime.

### Fase 4 — Critério de aceite

- Presets utilizáveis sem configuração extra.
- Tokens coerentes entre si.

## Fase 5 — Exporters públicos (CSS / JSON)

### Fase 5 — Objetivo

Gerar artefatos determinísticos para build-time.

### Fase 5 — Entregas

- `exportThemeCss`.
- `exportThemeJson`.

### Fase 5 — Tarefas

- [ ] Definir opções de export.
- [ ] Implementar CSS vars com fallback.
- [ ] Implementar JSON estruturado.
- [ ] Garantir ordem determinística.
- [ ] Testes de snapshot.

### Fase 5 — Critério de aceite

- Outputs reproduzíveis.
- Sem dependência do CLI.

## Fase 6 — CLI tooling

### Fase 6 — Objetivo

Facilitar adoção em projetos médios e grandes.

### Fase 6 — Comandos

- `palette-kit init`.
- `palette-kit build`.

### Fase 6 — Tarefas

- [ ] Implementar `init`.
- [ ] Gerar `palette.config.ts`.
- [ ] Implementar `build`.
- [ ] Integrar exporters.
- [ ] Gerar artefatos em `dist/palette/`.
- [ ] Flags básicas (no magic).

### Fase 6 — Critério de aceite

- CLI previsível.
- Nenhuma ação implícita.

## Fase 7 — Codegen de types (DX máximo)

### Fase 7 — Objetivo

Autocomplete total sem amarrar o core.

### Fase 7 — Entregas

- `tokens.ts`.
- `tokens.d.ts`.

### Fase 7 — Tarefas

- [ ] Gerar objeto navegável.
- [ ] Gerar unions (`TokenName`, `ColorRole`).
- [ ] JSDoc por token.
- [ ] Integração com CLI build.

### Fase 7 — Critério de aceite

- Autocomplete funcionando out-of-the-box.
- Zero impacto em runtime.

## Fase 8 — Inferência forte e validações DX

### Fase 8 — Objetivo

Reduzir configuração obrigatória sem perder segurança.

### Fase 8 — Tarefas

- [ ] Inferir `usage` por prefixo.
- [ ] Inferir `surface` quando óbvio.
- [ ] Implementar strict vs non-strict.
- [ ] Mensagens de erro didáticas.

### Fase 8 — Critério de aceite

- Menos parâmetros manuais.
- Erros claros e acionáveis.

## Fase 9 — Packaging e exports finais

### Fase 9 — Objetivo

Finalizar o shape público do pacote.

### Fase 9 — Tarefas

- [ ] Definir subpath exports.
- [ ] Validar tree-shaking.
- [ ] Garantir compatibilidade ESM.
- [ ] Atualizar README.

### Fase 9 — Critério de aceite

- Um único pacote npm.
- Imports claros e estáveis.

## Fase 10 — QA final e release

### Fase 10 — Objetivo

Garantir qualidade antes do release.

### Fase 10 — Checklist

- [ ] Testes unitários críticos.
- [ ] Testes de snapshot (exporters).
- [ ] Revisão de DX (autocomplete + docs).
- [ ] Atualizar changelog.
- [ ] Release v0.3.0.

## Resultado esperado

Ao final da v0.3, o Palette Kit será:

- Fácil de usar no runtime.
- Poderoso para projetos grandes.
- Tipado, documentado e previsível.
- Preparado para evolução (v0.4+).

## Próximos passos (v0.4+)

- Theming dinâmico por usuário.
- Data-driven color APIs.
- Plugins de framework (opcional).
- Visual tooling / inspector.
