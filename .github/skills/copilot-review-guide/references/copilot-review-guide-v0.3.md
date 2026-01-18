<!-- markdownlint-disable MD024 -->

# Palette Kit v0.3 — Guia de Revisao para Copilot

> Skill de revisao para validar a implementacao incremental da v0.3.
> Este documento serve como checklist tecnico para code reviews automatizadas ou assistidas.

## Como usar este guia

- Use este documento como referencia durante revisoes de PR/commits
- Cada fase possui criterios especificos que devem ser validados
- Todos os criterios gerais aplicam-se a todas as fases
- Falhas devem gerar feedback acionavel e especifico

---

## Criterios gerais (aplicam-se a todas as fases)

### 1. Contratos e tipos

- [ ] Nenhum tipo publico usa `any` ou `unknown` sem justificativa
- [ ] Tipos exportados tem JSDoc completo
- [ ] Nao ha circular imports
- [ ] Imports seguem a hierarquia: `types` -> `utils` -> `core` -> `engine` -> features
- [ ] Shape de `BaseResolvedColor` permanece estavel
- [ ] Nenhum breaking change nao documentado

### 2. Qualidade de codigo

- [ ] Build passa sem erros nem warnings
- [ ] Testes existem para novos comportamentos publicos
- [ ] Nenhum TODO ou FIXME em codigo production
- [ ] Funcoes complexas tem comentarios explicativos
- [ ] Codigo segue o style do Biome configurado

### 3. DX (Developer Experience)

- [ ] APIs publicas tem JSDoc com:

  - Descricao clara do proposito
  - Exemplos de uso
  - Parametros documentados
  - Trade-offs quando relevantes
- [ ] Erros possuem mensagens claras e acionaveis
- [ ] Nenhum comportamento "magico" nao documentado
- [ ] Autocomplete funcional (validar com TypeScript language server)

### 4. Principios da v0.3

- [ ] Runtime-first: core nao depende de tooling
- [ ] Serializer nao altera intencao visual
- [ ] Resolver nao retorna strings diretamente
- [ ] Nenhuma decisao visual oculta do desenvolvedor
- [ ] Determinismo: mesma entrada + opcoes = mesma saida

---

## Fase 0 — Preparacao

### Checklist especifico

- [ ] Branch `v0.3` criado e isolado
- [ ] v0.2 congelada com tag
- [ ] Specs tecnicas criadas em `src/planning/`
- [ ] Build limpo (sem alteracao funcional)
- [ ] CI verde
- [ ] `package.json` exports revisado

### O que NAO deve acontecer

- Mudanca de comportamento publico
- Alteracao de APIs existentes
- Refactors profundos

---

## Fase 1 — Serializer publico

### Checklist especifico

#### Estrutura

- [ ] Modulo `src/serialize/` criado
- [ ] Exports publicos definidos em `src/serialize/index.ts`
- [ ] Tipos publicos em `src/types/index.ts`

#### Tipos

- [ ] `ResolvedColor` definido e exportado
- [ ] `SerializeOptions` definido com defaults claros
- [ ] Propriedades opcionais claramente marcadas

#### Funcoes publicas

- [ ] `serializeColor(oklch, options?)` implementado
- [ ] `serializeResolved(baseResolved, options?)` implementado
- [ ] `theme.serialize(query, options?)` implementado

#### Espacos de cor

- [ ] OKLCH: formato `oklch(L% C H / A)` correto
- [ ] sRGB: suporte a hex, rgb(), rgba()
- [ ] Display-P3: formato `color(display-p3 r g b / a)` correto
- [ ] Conversoes preservam intencao perceptual

#### Gamut mapping

- [ ] Estrategia `clip` implementada
- [ ] Estrategia `compressChroma` implementada
- [ ] Estrategia `preferP3ThenCompress` (default) implementada
- [ ] Warnings claros quando clipping ocorre

#### Precision

- [ ] Arredondamento so no output final
- [ ] Defaults definidos: `{ l: 1, c: 3, h: 1, alpha: 2 }`
- [ ] Configuravel por canal
- [ ] Sem drift cumulativo

#### Strict mode

- [ ] `strict: false` (default): best-effort com warnings
- [ ] `strict: true`: erros claros e acionaveis
- [ ] Mensagens sem jargao matematico
- [ ] Erros incluem contexto e sugestoes

#### Metadata

- [ ] `includeMeta` opcional e false por default
- [ ] Meta contem: `spaceUsed`, `gamutMapping`, flags de transformacao
- [ ] Meta nunca influencia `value`

#### Testes

- [ ] Testes unitarios por espaco de cor
- [ ] Testes de gamut mapping
- [ ] Snapshots de serializacoes completas
- [ ] Testes de precision edge cases
- [ ] Testes de strict mode (erros + warnings)

#### Documentacao

- [ ] JSDoc explica trade-offs entre espacos
- [ ] Exemplos de uso para cada API
- [ ] Documentacao de gamut mapping
- [ ] Guia de quando usar cada espaco

### O que NAO deve acontecer

- Resolver cores dentro do serializer
- Decidir contraste
- Alterar L/C/H sem pedido explicito
- Comportamento implicito nao documentado
- Serializer acoplado ao core

---

## Fase 2 — Helpers DX no runtime

### Checklist especifico

#### APIs implementadas

- [ ] `resolveMany(queries[])` funcional
- [ ] `theme.withContext(context)` retorna tema bound
- [ ] `theme.colorCss(...)` wrapper conveniente
- [ ] `theme.onSolidCss(...)` wrapper conveniente

#### Comportamento

- [ ] Helpers nao escondem o core
- [ ] Typings inferem corretamente
- [ ] Performance nao degradada
- [ ] Helpers sao opcionais (core funciona sem eles)

#### Testes

- [ ] `resolveMany` com arrays vazios/grandes
- [ ] Tema bound mantem estado correto
- [ ] Helpers CSS retornam strings validas

#### Documentacao

- [ ] JSDoc focado em casos de uso
- [ ] Exemplos praticos
- [ ] Relacao clara com APIs core

### O que NAO deve acontecer

- Duplicacao de logica do core
- Comportamento diferente do core
- Magia ou inferencia excessiva

---

## Fase 3 — Token Registry

### Checklist especifico

#### Estrutura

- [ ] `TokenDefinition` interface definida
- [ ] `TokenRegistry` estrutura definida
- [ ] Validacao de queries implementada

#### Modelo declarativo

- [ ] Tokens nao carregam valores de cor
- [ ] Tokens apenas descrevem queries
- [ ] Registry independente do runtime
- [ ] Resolucao sempre via `theme.resolve`

#### Campos obrigatorios

- [ ] `name`: string unica
- [ ] `query`: ColorQuery valido
- [ ] `description`: string informativa
- [ ] `category`: agrupamento logico

#### Validacao

- [ ] Queries validadas na criacao
- [ ] Nomes unicos enforcados
- [ ] Categorias consistentes
- [ ] Erros claros em caso de duplicacao

#### Testes

- [ ] Registry com tokens validos
- [ ] Registry rejeita tokens invalidos
- [ ] Resolucao atraves do registry
- [ ] Validacao de queries

### O que NAO deve acontecer

- Tokens com valores hardcoded
- Registry acoplado a exporters
- Duplicacao de logica de resolucao
- Estados hardcoded (sao operadores)

---

## Fase 4 — Presets oficiais

### Checklist especifico

#### Presets implementados

- [ ] `minimal-ui` completo
- [ ] `radixLike-ui` completo
- [ ] `modern-ui` completo

#### Cada preset deve ter

- [ ] Tokens base documentados
- [ ] Categorias claras
- [ ] Estados suportados definidos
- [ ] Intencao semantica explicada
- [ ] Exemplos de uso

#### Coerencia

- [ ] Nomenclatura consistente entre presets
- [ ] Categorias alinhadas
- [ ] Documentacao padronizada
- [ ] Queries validos testados

#### Testes

- [ ] Cada preset exportavel
- [ ] Cada preset usavel em runtime
- [ ] Tokens resolvem corretamente
- [ ] Snapshots de exports

### O que NAO deve acontecer

- Tokens conflitantes
- Nomenclatura inconsistente
- Presets acoplados ao CLI
- Documentacao incompleta

---

## Fase 5 — Exporters publicos

### Checklist especifico

#### APIs

- [ ] `exportThemeCss(theme, tokenMap, options)` implementado
- [ ] `exportThemeJson(theme, tokenMap, options)` implementado

#### CSS output

- [ ] CSS variables com nomenclatura clara
- [ ] Fallbacks sRGB
- [ ] Override progressivo via `@supports`
- [ ] Ordem deterministica

#### JSON output

- [ ] Estrutura estavel
- [ ] Separacao por contexto (light/dark)
- [ ] Metadata opcional
- [ ] Schema documentado

#### Determinismo

- [ ] Mesma entrada = mesma saida
- [ ] Propriedades ordenadas
- [ ] Formatting consistente
- [ ] Reproduzivel em CI

#### Testes

- [ ] Snapshots de CSS
- [ ] Snapshots de JSON
- [ ] Export com diferentes opcoes
- [ ] Export de presets

#### Documentacao

- [ ] Opcoes de export documentadas
- [ ] Exemplos de uso
- [ ] Estrutura do output explicada

### O que NAO deve acontecer

- Output nao deterministico
- Dependencia do CLI
- Logica de resolucao duplicada
- Formatacao magica

---

## Fase 6 — CLI tooling

### Checklist especifico

#### Comandos

- [ ] `palette-kit init` implementado
- [ ] `palette-kit build` implementado

#### `init` behavior

- [ ] Cria `palette.config.ts` tipado
- [ ] JSDoc explicativo
- [ ] Sem comportamento magico
- [ ] Nao gera tokens automaticamente

#### `build` behavior

- [ ] Le config corretamente
- [ ] Integra exporters
- [ ] Gera em `dist/palette/`
- [ ] Outputs: `tokens.css`, `tokens.json`, `tokens.ts`, `tokens.d.ts`

#### Flags

- [ ] Flags documentadas
- [ ] Nenhuma flag oculta
- [ ] Validacao de argumentos
- [ ] Help text util

#### Erros

- [ ] Mensagens claras
- [ ] Exit codes corretos
- [ ] Sugestoes acionaveis

#### Testes

- [ ] CLI em projeto limpo
- [ ] CLI com config existente
- [ ] Build com diferentes configs
- [ ] Flags validadas

### O que NAO deve acontecer

- Comportamento implicito
- Sobrescrever arquivos sem aviso
- Flags magicas
- Defaults ocultos

---

## Fase 7 — Codegen de types

### Checklist especifico

#### Outputs

- [ ] `tokens.ts` com objeto navegavel
- [ ] `tokens.d.ts` com types
- [ ] Unions: `TokenName`, `ColorRole`, etc.

#### Autocomplete

- [ ] Navegacao por objeto funciona
- [ ] Unions inferem corretamente
- [ ] JSDoc por token presente
- [ ] Compativel com VS Code, WebStorm

#### Performance

- [ ] Zero custo em runtime
- [ ] Tree-shaking funcional
- [ ] Bundle size nao explode

#### Integracao

- [ ] Gerado por `palette-kit build`
- [ ] Core continua aceitando `string`
- [ ] Types sao opcional enhancement

#### Testes

- [ ] Codegen de preset simples
- [ ] Codegen de preset complexo
- [ ] Validacao de types gerados

### O que NAO deve acontecer

- Runtime acoplado a types gerados
- Types obrigatorios para uso
- Codegen quebra tree-shaking

---

## Fase 8 — Inferencia e validacoes

### Checklist especifico

#### Inferencia implementada

- [ ] `usage` inferido por prefixo de role
- [ ] `surface` inferido quando obvio
- [ ] `variant` inferido se omitido

#### Strict mode

- [ ] `strict: false`: warnings + fallback
- [ ] `strict: true`: erros claros
- [ ] Mensagens didaticas
- [ ] Sugestoes de correcao

#### Validacoes

- [ ] Queries invalidos detectados
- [ ] Conflitos de inferencia apontados
- [ ] Fallbacks documentados

#### Testes

- [ ] Inferencia correta em casos comuns
- [ ] Inferencia falha gracefully
- [ ] Strict mode valida edge cases
- [ ] Mensagens de erro testadas

### O que NAO deve acontecer

- Inferencia silenciosa incorreta
- Erros cripticos
- Strict mode muito permissivo
- Fallbacks inesperados

---

## Fase 9 — Packaging e exports

### Checklist especifico

#### Subpath exports

- [ ] "." -> main export
- [ ] "./serialize" -> serializer
- [ ] "./export" -> exporters
- [ ] "./cli" -> CLI (se relevante)

#### Compatibilidade

- [ ] ESM funcional
- [ ] CJS funcional (se suportado)
- [ ] Types exportados corretamente
- [ ] Tree-shaking validado

#### Validacao

- [ ] Imports funcionam em projeto real
- [ ] Bundlers comuns (Vite, Webpack, esbuild) funcionam
- [ ] Types resolvem em editores

#### Documentacao

- [ ] README atualizado
- [ ] Migration guide (se breaking)
- [ ] Exemplos de import

### O que NAO deve acontecer

- Exports ambiguos
- Breaking no packaging
- Tree-shaking quebrado
- Types nao resolvidos

---

## Fase 10 — QA final e release

### Checklist especifico

#### Testes

- [ ] Todos os testes unitarios passam
- [ ] Snapshots atualizados e validados
- [ ] Testes de integracao (se houver)
- [ ] Performance nao regrediu

#### DX validation

- [ ] Autocomplete funcional em VS Code
- [ ] Hover docs aparecem
- [ ] Go-to-definition funciona
- [ ] Nenhum erro TypeScript no workspace

#### Documentacao

- [ ] Changelog atualizado
- [ ] Migration guide completo (se breaking)
- [ ] README reflete v0.3
- [ ] Exemplos funcionam

#### Pre-release

- [ ] Versao bumped corretamente
- [ ] Git tags criados
- [ ] Build CI verde
- [ ] Dry-run de publish OK

#### Release

- [ ] Publicado no npm
- [ ] GitHub release criado
- [ ] Announcement preparado

### O que NAO deve acontecer

- Release com testes falhando
- Documentacao desatualizada
- Breaking changes nao documentados
- Versao errada

---

## Comandos uteis para validacao

```bash
# Build limpo
npm run build

# Testes
npm test
npm run test:watch

# Linting
npm run lint

# Type checking
npm run typecheck

# Dry-run publish
npm pack
npm publish --dry-run

# Validar exports
node -e "import('palette-kit')"
node -e "import('palette-kit/serialize')"
```

---

## Feedback estruturado em revisoes

### Template de feedback

```markdown
## Aprovado / Necessita correcoes / Bloqueado

### Criterios gerais
- [x] Item OK
- [ ] Item pendente: [explicacao + sugestao]

### Criterios da fase X
- [x] Item OK
- [ ] Item pendente: [explicacao + sugestao]

### Comentarios adicionais
- Observacao 1
- Observacao 2

### Proximos passos sugeridos
1. Acao 1
2. Acao 2
```

---

## Referencias

- `src/planning/spec-v0.3.md` — Spec geral
- `src/planning/spec-serializer-v0.3.md` — Spec do serializer
- `src/planning/roadmap-v0.3.md` — Roadmap de implementacao
- `AGENTS.md` — Guidance geral

---

## Principios de feedback

1. Acionavel: sempre sugerir correcao ou alternativa
2. Especifico: apontar linha/arquivo quando relevante
3. Construtivo: explicar o "porque", nao apenas o "o que"
4. Priorizado: separar blockers de nice-to-haves
5. Consistente: seguir sempre este guia

---

Versao do guia: 1.0
Ultima atualizacao: 18 de janeiro de 2026
