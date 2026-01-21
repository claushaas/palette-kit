# AGENTS

Guidance for agents working in this repo. Keep this aligned with the actual library
surface in `src/` and the current planning docs in `planning/v0.4`.

## Idioma das respostas

- Sempre responder em português (pt-BR), independentemente do idioma dos documentos ou da mensagem do usuário.
- Todo conteúdo escrito no repositório deve ser em inglês.

## Estrutura e dependências

- Mantenha o layout de pastas sob `src/` alinhado com a spec: `core`, `engine`, `contrast`, `operators`, `export`, `presets`, `types`, `utils`.
- Dependências obrigatórias: `culori` e uma implementação de APCA (`apca-w3` é aceitável).

## Tipos públicos e contratos

- Tipos públicos vivem em `src/types/index.ts`. Implementar estes tipos sem lógica de negócio:
  `CssColorString`, `ColorSpace`, `ColorContext`, `SurfaceIntent`, `ColorState`,
  `ColorEmphasis`, `SemanticVariant`, `ColorRole`, `ColorUsage`, `TokenBackgroundHint`,
  `TokenQuery`, `TokenState`, `TokenStates`, `BackgroundHint`, `ContrastRequirement`,
  `AlphaStrategy`, `OutputOptions`, `RawColor`, `ColorMeta`, `TokenDefinition`,
  `TokenRegistry`, `ResolvedColor`, `ColorQuery`, `OnSolidQuery`, `SemanticColorTheme`.
- Critérios de aceitação: build deve passar e não pode haver imports circulares.
