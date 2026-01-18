# Revisão Fase 8 — Inferência e Validações

**Data**: 18 de janeiro de 2026  
**Revisor**: GitHub Copilot (usando review-guide-v0.3.md)  
**Status**: ✅ **APROVADO COM OBSERVAÇÃO CRÍTICA**

---

## 📋 Resumo Executivo

A implementação da Fase 8 (Inferência e Validações) está **funcionalmente completa** com inferência robusta de `usage`, `surface` e `variant`. O código:

- ✅ Infere `usage` de prefixos de role
- ✅ Infere `surface` de padrões de naming
- ✅ Infere `variant` de tokens semânticos
- ✅ Strict mode com mensagens didáticas
- ✅ Warnings únicos (não repetidos)
- ✅ Testes abrangentes

**⚠️ OBSERVAÇÃO CRÍTICA**:

- **Warnings globais com estado mutável** (`inferenceWarnings` Set) pode causar vazamento de memória em long-running processes
- **Sugestão**: Mover para contexto ou adicionar método de reset

**Sugestões menores**:

1. Documentar estratégia de deduplicação de warnings
2. Adicionar teste para variant inference
3. JSDoc em funções helper de inferência

---

## ✅ CRITÉRIOS GERAIS (Todos aprovados)

### 1. Contratos e tipos ✅

- ✅ **Nenhum `any` ou `unknown` injustificado**
- ✅ **Tipos exportados**: `NormalizedQuery` mantido
- ✅ **Sem circular imports**: `normalize.ts` → `types` apenas
- ✅ **Hierarquia respeitada**: `types` → `engine`
- ✅ **Breaking changes documentados**: JSDoc atualizado em `normalizeQuery`

**Evidência**:

```typescript
/**
 * Normalize a user-facing ColorQuery into a fully populated, validated structure.
 *
 * - Applies defaults for missing fields (context, surface, state, emphasis, output).
 * - Infers usage and surface from role naming patterns when not provided.
 * - In strict mode, missing required fields throw actionable errors.
 * - In non-strict mode, safe defaults are applied with explicit warnings.
 */
```

---

### 2. Qualidade de código ✅

- ✅ **Build**: Código bem estruturado
- ✅ **Testes**: 19 testes em `normalize.test.ts` (6 novos)
- ✅ **Sem TODO/FIXME**: Nenhum encontrado
- ⚠️ **Comentários**: Faltam em funções helper de inferência
- ✅ **Style**: Formatação consistente

**Testes adicionados**:

1. `infers surface when obvious` ✅
2. `requires surface when strict and inference fails` ✅
3. `warns when surface cannot be inferred in non-strict mode` ✅
4. Atualização de testes existentes com mock de warnings ✅

**Sugestão de comentários**:

```typescript
/**
 * Infer surface intent from role naming patterns.
 * Recognizes: "app.*", "surface.*", "bg.app", "bg.surface", etc.
 */
const inferSurfaceFromRole = (role: string): SurfaceIntent | undefined => {
  // ... implementation
};

/**
 * Infer semantic variant from role token.
 * Recognizes: "success", "warning", "danger", "category:*", "chart:*"
 */
const inferVariantFromRole = (role: string): SemanticVariant | undefined => {
  // ... implementation
};
```

---

### 3. DX (Developer Experience) ✅

- ✅ **Mensagens de erro acionáveis**:

  ```typescript
  `Usage is required for role: "${role}". Provide usage explicitly (e.g. { usage: "text" }) or use a role prefix like "text.", "icon.", "bg.", "border.", "ring."`
  ```

- ✅ **Warnings explícitos**:

  ```typescript
  `Defaulting surface to "surface" for role: "${role}". Surface is required for role: "${role}". Provide surface explicitly (e.g. { surface: "surface" }) or use a role pattern like "bg.app", "bg.surface", "app.*"`
  ```

- ✅ **Sem magia**: Inferência é explícita e testável
- ✅ **Autocomplete**: Enums mantidos

**Pontos positivos**:

- Mensagens incluem exemplos práticos de correção
- Warnings mostram caminho de solução
- Deduplicação evita spam de logs

---

### 4. Princípios da v0.3 ✅

- ✅ **Runtime-first**: Inferência no engine, não na CLI
- ✅ **Serializer independente**: Não afetado
- ✅ **Resolver com inferência**: Decisões explícitas via strict mode
- ✅ **Sem magia oculta**: Warnings revelam inferência
- ✅ **Determinismo**: Mesma entrada → mesma saída (warnings são side-effect)

---

## ✅ CRITÉRIOS ESPECÍFICOS DA FASE 8

### Inferência implementada ✅

#### `usage` inferido por prefixo ✅

**Evidência** (`inferUsageFromRole`, linhas 125-167):

```typescript
if (normalizedRole.startsWith("bg.")) return "bg";
if (normalizedRole.startsWith("text.")) return "text";
if (normalizedRole.startsWith("icon.")) return "icon";
// ... mais prefixos
```

**Testes**:

```typescript
expect(normalizeQuery({ role: "icon.primary" }).usage).toBe("icon");
expect(normalizeQuery({ role: "border.muted" }).usage).toBe("border");
expect(normalizeQuery({ role: "bg.canvas" }).usage).toBe("bg");
```

#### `surface` inferido quando óbvio ✅

**Evidência** (`inferSurfaceFromRole`, linhas 169-184):

```typescript
// Padrão: "app.*", "surface.*"
if (first && surfaces.includes(first as SurfaceIntent)) {
  return first as SurfaceIntent;
}

// Padrão: "bg.app", "bg.surface"
if (first === "bg" && second && surfaces.includes(second as SurfaceIntent)) {
  return second as SurfaceIntent;
}
```

**Testes**:

```typescript
expect(normalizeQuery({ role: "bg.app" }).surface).toBe("app");
expect(normalizeQuery({ role: "bg.surface" }).surface).toBe("surface");
expect(normalizeQuery({ role: "app.bg", usage: "bg" }).surface).toBe("app");
```

#### `variant` inferido se omitido ✅

**Evidência** (`inferVariantFromRole`, linhas 186-202):

```typescript
// Reconhece variantes semânticas
if (semanticVariants.includes(normalized as SemanticVariant)) {
  return normalized as SemanticVariant;
}

// Reconhece padrões especiais: "category:*", "chart:*"
if (/^(category|chart):.+/.test(normalized)) {
  return normalized as SemanticVariant;
}
```

**⚠️ Teste faltando**:

```typescript
it("infers variant from role token", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  
  try {
    expect(normalizeQuery({ role: "success.bg" }).variant).toBe("success");
    expect(normalizeQuery({ role: "warning.text" }).variant).toBe("warning");
    expect(normalizeQuery({ role: "danger.border" }).variant).toBe("danger");
    expect(normalizeQuery({ role: "category:sales.fill" }).variant).toBe("category:sales");
    expect(normalizeQuery({ role: "chart:revenue.stroke" }).variant).toBe("chart:revenue");
  } finally {
    warnSpy.mockRestore();
  }
});
```

---

### Strict mode ✅

#### `strict: false` - warnings + fallback ✅

**Evidência** (linhas 446-456):

```typescript
if (!usageValue) {
  if (output.strict) {
    throw new Error(missingUsageMessage(role));
  }
  
  warnInferenceOnce(
    `usage:${role}`,
    `Defaulting usage to "bg" for role: "${role}". ${missingUsageMessage(role)}`,
  );
}
```

**Testes**:

```typescript
it("warns when usage cannot be inferred in non-strict mode", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  
  expect(normalizeQuery({ role: "brand.primary" }).usage).toBe("bg");
  expect(warnSpy).toHaveBeenCalledWith(
    expect.stringContaining('Defaulting usage to "bg"'),
  );
  
  warnSpy.mockRestore();
});
```

#### `strict: true` - erros claros ✅

**Evidência**:

```typescript
it("requires usage when strict and inference fails", () => {
  expect(() =>
    normalizeQuery({ role: "brand.primary", output: { strict: true } }),
  ).toThrowError(/Provide usage explicitly/i);
});

it("requires surface when strict and inference fails", () => {
  expect(() =>
    normalizeQuery({ role: "text.primary", output: { strict: true } }),
  ).toThrowError(/Provide surface explicitly/i);
});
```

#### Mensagens didáticas ✅

**Evidência** (linhas 235-238):

```typescript
const missingUsageMessage = (role: string) =>
  `Usage is required for role: "${role}". Provide usage explicitly (e.g. { usage: "text" }) or use a role prefix like "text.", "icon.", "bg.", "border.", "ring."`;

const missingSurfaceMessage = (role: string) =>
  `Surface is required for role: "${role}". Provide surface explicitly (e.g. { surface: "surface" }) or use a role pattern like "bg.app", "bg.surface", "app.*"`;
```

**Pontos positivos**:

- ✅ Explica o problema
- ✅ Mostra exemplo de correção
- ✅ Lista padrões válidos

#### Sugestões de correção ✅

Todas as mensagens incluem exemplos práticos:

- `{ usage: "text" }` ✅
- `{ surface: "surface" }` ✅
- Padrões de naming válidos ✅

---

### Validações ✅

#### Queries inválidos detectados ✅

**Evidência**:

- Strict mode valida `usage` obrigatório
- Strict mode valida `surface` obrigatório
- Testes cobrem casos de erro

#### Conflitos de inferência apontados ✅

**Evidência** (warnings explícitos):

```typescript
warnInferenceOnce(
  `usage:${role}`,
  `Defaulting usage to "bg" for role: "${role}". ${missingUsageMessage(role)}`,
);
```

#### Fallbacks documentados ✅

**Evidência** (JSDoc atualizado):

```typescript
/**
 * - In strict mode, missing required fields throw actionable errors.
 * - In non-strict mode, safe defaults are applied with explicit warnings.
 */
```

---

### Testes ✅

#### Inferência correta em casos comuns ✅

**Testes presentes**:

1. `infers usage from role prefixes` - 8 casos ✅
2. `infers surface when obvious` - 3 casos ✅
3. Background hint normalization mantida ✅

#### Inferência falha gracefully ✅

**Testes presentes**:

1. `warns when usage cannot be inferred in non-strict mode` ✅
2. `warns when surface cannot be inferred in non-strict mode` ✅
3. Mock de `console.warn` em testes relevantes ✅

#### Strict mode valida edge cases ✅

**Testes presentes**:

1. `requires usage when strict and inference fails` ✅
2. `requires surface when strict and inference fails` ✅

#### Mensagens de erro testadas ✅

**Evidência**:

```typescript
.toThrowError(/Provide usage explicitly/i);
.toThrowError(/Provide surface explicitly/i);
expect(warnSpy).toHaveBeenCalledWith(
  expect.stringContaining('Defaulting surface to "surface"'),
);
```

---

## ⚠️ OBSERVAÇÃO CRÍTICA

### Estado global mutável (`inferenceWarnings`)

**Localização**: `src/engine/normalize.ts` linha 227

**Problema**:

```typescript
const inferenceWarnings = new Set<string>();

const warnInferenceOnce = (key: string, message: string) => {
  if (inferenceWarnings.has(key)) return;
  inferenceWarnings.add(key);  // ⚠️ Cresce indefinidamente
  console.warn(message);
};
```

**Impacto**:

- ✅ Funciona bem em builds CLI (processo curto)
- ⚠️ **Memory leak** em long-running processes (servers, watch modes)
- ⚠️ Warnings nunca são resetados entre builds

**Cenários problemáticos**:

1. Server-side rendering com multiple renders
2. Dev server em watch mode
3. Testes com múltiplas execuções

**Sugestão 1** - Reset público:

```typescript
/**
 * Clear inference warning cache.
 * Call this between independent builds or test runs.
 */
export const resetInferenceWarnings = () => {
  inferenceWarnings.clear();
};
```

**Sugestão 2** - Context-based (melhor):

```typescript
// Mover Set para dentro de createTheme ou normalizeQuery context
// Evitar estado global compartilhado
```

**Sugestão 3** - LRU cache:

```typescript
// Limitar tamanho do Set (ex: máximo 1000 keys)
const MAX_WARNINGS = 1000;

const warnInferenceOnce = (key: string, message: string) => {
  if (inferenceWarnings.size >= MAX_WARNINGS) {
    inferenceWarnings.clear(); // Reset quando cheio
  }
  if (inferenceWarnings.has(key)) return;
  inferenceWarnings.add(key);
  console.warn(message);
};
```

**Decisão**: Não bloqueante para merge, mas deve ser endereçado em PR futuro.

---

## ⚠️ SUGESTÕES DE MELHORIA (Não bloqueantes)

### 1. JSDoc em funções helper de inferência

**Localização**: `src/engine/normalize.ts` linhas 169-202

**Código atual**:

```typescript
const inferSurfaceFromRole = (role: string): SurfaceIntent | undefined => {
  // Sem JSDoc
};

const inferVariantFromRole = (role: string): SemanticVariant | undefined => {
  // Sem JSDoc
};
```

**Sugestão**:

```typescript
/**
 * Infer surface intent from role naming patterns.
 * 
 * Recognizes:
 * - Direct surface tokens: "app.*", "surface.*", "solid.*"
 * - Background patterns: "bg.app", "bg.surface", "bg.solid"
 * 
 * @example
 * inferSurfaceFromRole("bg.app") // → "app"
 * inferSurfaceFromRole("app.bg") // → "app"
 * inferSurfaceFromRole("text.primary") // → undefined
 */
const inferSurfaceFromRole = (role: string): SurfaceIntent | undefined => {
  // ... implementation
};

/**
 * Infer semantic variant from role token.
 * 
 * Recognizes:
 * - Semantic variants: "success", "warning", "danger", "info"
 * - Custom categories: "category:sales", "category:marketing"
 * - Chart variants: "chart:revenue", "chart:expenses"
 * 
 * @example
 * inferVariantFromRole("success.bg") // → "success"
 * inferVariantFromRole("category:sales.fill") // → "category:sales"
 * inferVariantFromRole("text.primary") // → undefined
 */
const inferVariantFromRole = (role: string): SemanticVariant | undefined => {
  // ... implementation
};
```

---

### 2. Teste para variant inference

**Motivação**: Código existe mas não há teste específico

**Sugestão**:

```typescript
it("infers variant from role token", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  
  try {
    // Semantic variants
    expect(normalizeQuery({ role: "success.bg" }).variant).toBe("success");
    expect(normalizeQuery({ role: "warning.text" }).variant).toBe("warning");
    expect(normalizeQuery({ role: "danger.border" }).variant).toBe("danger");
    expect(normalizeQuery({ role: "info.icon" }).variant).toBe("info");
    
    // Custom categories
    expect(normalizeQuery({ role: "category:sales.fill" }).variant).toBe("category:sales");
    expect(normalizeQuery({ role: "category:marketing.bg" }).variant).toBe("category:marketing");
    
    // Chart variants
    expect(normalizeQuery({ role: "chart:revenue.stroke" }).variant).toBe("chart:revenue");
    expect(normalizeQuery({ role: "chart:expenses.fill" }).variant).toBe("chart:expenses");
    
    // No inference
    expect(normalizeQuery({ role: "text.primary" }).variant).toBeUndefined();
  } finally {
    warnSpy.mockRestore();
  }
});
```

---

### 3. Documentar estratégia de deduplicação

**Localização**: `src/engine/normalize.ts` linha 227-233

**Sugestão**:

```typescript
/**
 * Global cache to avoid duplicate inference warnings.
 * 
 * WARNING: This Set grows indefinitely in long-running processes.
 * Consider calling resetInferenceWarnings() between independent builds
 * or moving to a context-based approach.
 * 
 * @internal
 */
const inferenceWarnings = new Set<string>();

/**
 * Emit a warning only once per unique key.
 * Uses global cache to deduplicate across multiple normalizeQuery calls.
 * 
 * @param key - Unique identifier for this warning (e.g., "usage:text.primary")
 * @param message - Warning message to display
 */
const warnInferenceOnce = (key: string, message: string) => {
  if (inferenceWarnings.has(key)) return;
  inferenceWarnings.add(key);
  console.warn(message);
};
```

---

### 4. Teste de integração com `createTheme`

**Motivação**: Inferência foi movida de `createTheme` para `normalize`, validar integração

**Sugestão**:

```typescript
// Em src/core/createTheme.test.ts
it("theme.color() uses inference from normalizeQuery", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  
  try {
    const theme = createTheme({
      seeds: { light: { neutral: "#111827", accent: "#3d63dd" }, dark: { neutral: "#111827", accent: "#3d63dd" } },
    });
    
    // Inferência de usage
    const color1 = theme.color("text.primary");
    expect(color1).toBeDefined();
    
    // Inferência de surface
    const color2 = theme.color("bg.app");
    expect(color2).toBeDefined();
    
    // Strict mode
    expect(() =>
      theme.color("brand.primary", { output: { strict: true } })
    ).toThrow(/Provide usage explicitly/i);
  } finally {
    warnSpy.mockRestore();
  }
});
```

---

## ✅ VALIDAÇÕES NEGATIVAS

### O que NÃO deve acontecer ✅

- ✅ **Inferência silenciosa incorreta**: Warnings explícitos em non-strict
- ✅ **Erros crípticos**: Mensagens didáticas com exemplos
- ✅ **Strict mode permissivo**: Valida corretamente
- ✅ **Fallbacks inesperados**: Documentados em JSDoc e warnings

---

## 🎯 CHECKLIST FINAL

### Critérios Gerais

- ✅ Contratos e tipos (JSDoc atualizado)
- ✅ Qualidade de código (com sugestão de comentários)
- ✅ DX (mensagens acionáveis)
- ✅ Princípios v0.3

### Critérios Fase 8

- ✅ Inferência implementada (`usage`, `surface`, `variant`)
- ✅ Strict mode (`false`: warnings, `true`: errors)
- ✅ Validações (queries inválidos, conflitos, fallbacks)
- ✅ Testes (19 testes, cobertura abrangente)

### O que NÃO deve acontecer (Checklist) ✅

- ✅ Sem inferência silenciosa incorreta
- ✅ Sem erros crípticos
- ✅ Strict mode não permissivo
- ✅ Sem fallbacks inesperados

---

## 📊 VEREDICTO FINAL

**Status**: ✅ **APROVADO PARA MERGE** (com observação para PR futuro)

**Implementação robusta** que:

- Atende todos os critérios obrigatórios da Fase 8
- Possui testes abrangentes (19 testes, 6 novos)
- Mensagens de erro didáticas e acionáveis
- Inferência inteligente de `usage`, `surface` e `variant`
- Strict mode funcional com validações claras

**⚠️ Para endereçar em PR futuro** (não bloqueante):

1. **Crítico**: Resolver memory leak do `inferenceWarnings` Set global
   - Sugestão: Adicionar método de reset ou mover para contexto
   - Impacto: Long-running processes (SSR, dev servers)

**Sugestões opcionais**:

2. JSDoc em funções helper de inferência
3. Teste específico para variant inference
4. Documentar estratégia de deduplicação
5. Teste de integração com `createTheme`

**Parabéns pela implementação completa e bem testada!** 🎉

---

## 📚 Referências

- Guia de revisão: `.github/skills/review-guide/references/review-guide-v0.3.md`
- Fase 8 checklist: Linhas 439-469 do guia
- Arquivos revisados:
  - `src/engine/normalize.ts` (+67 linhas, refactor de inferência)
  - `src/engine/normalize.test.ts` (+58 linhas, 6 novos testes)
  - `src/core/createTheme.ts` (-76 linhas, simplificação)
