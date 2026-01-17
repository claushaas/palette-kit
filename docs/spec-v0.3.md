# Palette Kit — SPEC v0.3

> Especificação formal da versão v0.3 do Palette Kit.  
> Documento orientado à implementação, com foco absoluto em Developer Experience (DX), contratos explícitos e evolução sustentável do produto.

---

## 1. Visão geral

A v0.3 transforma o Palette Kit em uma biblioteca **runtime-first**, com **DX elevada por padrão**, contratos públicos claros e **tooling opcional** (serializers, exporters, CLI e codegen).

A biblioteca passa a atender bem:

- desenvolvedores comuns (uso direto no runtime)
- times grandes (token registry, exporters, codegen)
- ambientes web e mobile (web / React Native)

---

## 2. Produto

- **Runtime-first** é o caminho oficial
- CLI, exporters e codegen são **helpers**, não dependências obrigatórias
- A lib deve ser **útil imediatamente após instalar**

---

## 3. Resolver (core)

### 3.1 Contrato

- `createTheme()` permanece como entrypoint
- `theme.resolve()` e `theme.onSolid()` retornam **BaseResolvedColor**
- `BaseResolvedColor`:
  - **não é exportado como type**
  - **tem shape estável garantido em toda a linha v0.x**
- Strings de cor **não** são retornadas automaticamente

### 3.2 Justificativa

- Mantém o core agnóstico de output
- Evita acoplamento com CSS, React Native ou JSON
- Facilita evolução futura (novos formatos, novos targets)

---

## 4. Serializer público (camadas de DX)

### 4.1 Objetivo

Fornecer uma **ponte oficial e tipada** entre o resolver e o mundo real (CSS, RN, JSON), sem esconder decisões importantes do desenvolvedor.

### 4.2 APIs obrigatórias

```ts
serializeColor(oklch, options?) -> ResolvedColor
serializeResolved(baseResolved, options?) -> ResolvedColor
theme.serialize(query, options?) -> ResolvedColor
```

### 4.3 Requisitos

- Suporte a:
  - `oklch()`
  - `hex`, `rgb()`, `rgba()`
  - `color(display-p3 ...)`
- Opções:
  - `preferSpace`
  - `includeSpaces`
  - `precision`
  - `strict`
- Estratégia de gamut mapping default:
  - `preferP3ThenCompress`
- `ResolvedColor`:
  - contém strings serializadas
  - pode incluir múltiplos espaços
  - pode incluir metadados opcionais
- **JSDoc obrigatório**, explicando:
  - trade-offs entre espaços de cor
  - implicações de gamut mapping
  - impacto de precisão e strict mode

---

## 5. Exporters públicos (CSS / JSON)

### 5.1 Objetivo

Gerar artefatos determinísticos para projetos que desejam tokens persistentes, sem obrigar esse modelo no runtime.

### 5.2 APIs públicas

```ts
exportThemeCss(theme, tokenMap, options)
exportThemeJson(theme, tokenMap, options)
```

### 5.3 Regras

- Exporters **não são obrigatórios** para uso do runtime
- Outputs devem ser:
  - determinísticos
  - ordenados
  - previsíveis
- CSS:
  - CSS variables com fallback
  - override progressivo via `@supports`
- JSON:
  - estrutura estável
  - separação explícita por contexto (`light` / `dark`)

---

## 6. Token Registry (caminho deluxe)

### 6.1 Modelo

Tokens são definidos como **objetos ricos**, não apenas nomes:

```ts
{
  name: "bg.app",
  description: "Application background",
  query: { role, usage, surface },
  category: "background",
  states?: {
    hover?: boolean
    active?: boolean
  }
}
```

### 6.2 Regras

- Registry é **declarativo**
- Tokens:
  - não carregam valores de cor
  - sempre resolvem via `theme.resolve`
- Registry é consumido por:
  - exporters
  - CLI
  - codegen

---

## 7. Estados — modelo híbrido

- Token registry define **tokens base**
- Estados (`hover`, `active`, etc.) são **operadores**
- CLI e exporters:
  - podem gerar tokens derivados
  - nunca duplicam lógica de resolução

---

## 8. Presets de token map (obrigatórios)

### Presets oficiais

1. `minimal-ui`
2. `radixLike-ui`
3. `modern-ui`

Cada preset define:

- tokens base
- categorias
- estados suportados
- documentação embutida (descrições e intenção semântica)

---

## 9. CLI tooling

### 9.1 `palette-kit init`

- Cria `palette.config.ts`
- Arquivo totalmente tipado
- Com JSDoc explicativo
- Sem comportamento mágico
- Não gera tokens automaticamente

### 9.2 `palette-kit build`

- Gera artefatos em `dist/palette/`:
  - `tokens.css`
  - `tokens.json`
  - `tokens.ts`
  - `tokens.d.ts`
- Pode gerar:
  - `report.md` (opcional)
- Flag `--watch` é opcional e **não MVP**

---

## 10. Codegen de types (DX máximo)

### 10.1 Objetivos

- Autocomplete completo
- Navegação por objeto
- Zero custo em runtime

### 10.2 Outputs

- Objeto navegável:

  ```ts
  tokens.bg.app
  tokens.text.primary
  ```

- Unions:

  ```ts
  type TokenName = ...
  type ColorRole = ...
  ```

### 10.3 Regras

- JSDoc por token
- Compatível com editores comuns
- Core runtime continua aceitando `string`

---

## 11. Autocomplete sem amarrar o core

- Runtime:
  - aceita `string`
- Tooling:
  - gera types específicos por projeto
- APIs automaticamente se beneficiam desses tipos

---

## 12. `theme.color(role, options)` com inferência forte

### Comportamento

- Inferir automaticamente:
  - `usage`
  - `surface`
  - `variant`
- Inferência baseada no prefixo do role

### Strict mode

- `strict: true`
  - erro claro, didático e acionável
- `strict: false`
  - fallback seguro
  - warning explícito

---

## 13. Ergonomia adicional

### APIs

- `resolveMany(queries[])`
- `withContext("light" | "dark")` retorna um tema bound

### Helpers

- `theme.colorCss(...)`
- `theme.onSolidCss(...)`

---

## 14. Packaging

- Um único pacote npm
- Uso de **subpath exports**:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./serialize": "./dist/serialize.js",
    "./export": "./dist/export.js",
    "./cli": "./dist/cli.js"
  }
}
```

---

## 15. Princípios de DX

- Runtime-first por default
- Contratos explícitos e previsíveis
- Zero comportamento oculto
- JSDoc tratado como parte da API
- Determinismo acima de “conveniência mágica”

---

## 16. Critérios de aceite

- Build passa
- Nenhum import circular
- API pública corresponde integralmente à spec
- DX validável apenas via autocomplete + hover docs
