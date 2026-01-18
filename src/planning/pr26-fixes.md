<!-- markdownlint-disable MD026 MD031 MD032 MD034 -->

# PR #26 - Correções Necessárias

> Checklist de correções para o PR #26 (feat(cli): add init/build tooling) baseado no guia oficial de revisão v0.3.

**Status Atual**: ❌ Changes Requested  
**Fase**: 6 - CLI tooling  
**Data**: 18 de janeiro de 2026

---

## 🔴 BLOCKERS (Devem ser corrigidos antes do merge)

### 1. Tratamento de erro incorreto em `main()`

**Arquivo**: `src/cli.ts` (linhas 263-268)

**Problema**: O catch principal mostra help para TODOS os erros, incluindo erros de validação de config, I/O, etc. Help só deve aparecer para erros de parsing de argumentos ou quando explicitamente solicitado com `--help`.

**Código atual**:
```typescript
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  printHelp();  // ❌ ERRADO
  process.exitCode = 1;
}
```

**Correção**:
```typescript
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  // Não mostrar help - apenas para erros de argumento
  process.exitCode = 1;
}
```

---

### 2. Validação incompleta de config

**Arquivo**: `src/cli.ts` (linhas 122-124)

**Problema**: `validateConfig` apenas verifica se `seeds.light` e `seeds.dark` existem, mas não valida se contêm as propriedades obrigatórias `neutral` e `accent` como strings. Isso causará erro em runtime quando o código tentar usar essas propriedades.

**Código atual**:
```typescript
if (!config.theme.seeds?.light || !config.theme.seeds?.dark) {
  throw new Error("Config.theme.seeds.light and .dark are required");
}
```

**Correção**:
```typescript
const seeds = config.theme.seeds;
if (!seeds?.light || !seeds?.dark) {
  throw new Error("Config.theme.seeds.light and .dark are required");
}

const validateSeedColors = (context: 'light' | 'dark', seed: unknown) => {
  if (typeof seed !== 'object' || seed === null) {
    throw new Error(`Config.theme.seeds.${context} must be an object`);
  }
  const s = seed as Record<string, unknown>;
  if (typeof s.neutral !== 'string') {
    throw new Error(`Config.theme.seeds.${context}.neutral must be a string color`);
  }
  if (typeof s.accent !== 'string') {
    throw new Error(`Config.theme.seeds.${context}.accent must be a string color`);
  }
};

validateSeedColors('light', seeds.light);
validateSeedColors('dark', seeds.dark);
```

---

### 3. Falta de testes

**Problema**: Nenhum arquivo `cli.test.ts` existe. O repositório tem boa cobertura de testes em todos os outros módulos, mas o CLI está sem nenhum teste.

**Ação**: Criar `src/cli.test.ts` com os seguintes testes:

#### Testes necessários:

```typescript
import { describe, expect, it } from 'vitest';
// Importar funções necessárias do cli.ts

describe('CLI - parseArgs', () => {
  it('deve parsear comando init', () => {
    // Test parseArgs(['init'])
  });

  it('deve parsear comando build com flags', () => {
    // Test parseArgs(['build', '--config', 'custom.ts', '--outDir', 'out'])
  });

  it('deve reconhecer flags help e version', () => {
    // Test parseArgs(['--help']) e parseArgs(['--version'])
  });

  it('deve parsear flag force como boolean', () => {
    // Test parseArgs(['init', '--force'])
  });

  it('deve parsear flag report como boolean', () => {
    // Test parseArgs(['build', '--report'])
  });

  it('deve lançar erro para argumento desconhecido', () => {
    // Test parseArgs(['unknown-arg']) throws
  });
});

describe('CLI - validateConfig', () => {
  it('deve aceitar config válido', () => {
    // Test com config válido completo
  });

  it('deve rejeitar config sem theme', () => {
    // Test lança erro
  });

  it('deve rejeitar config sem seeds.light', () => {
    // Test lança erro
  });

  it('deve rejeitar config sem seeds.dark', () => {
    // Test lança erro
  });

  it('deve rejeitar seeds.light sem neutral', () => {
    // Test lança erro com mensagem clara
  });

  it('deve rejeitar seeds.light sem accent', () => {
    // Test lança erro com mensagem clara
  });

  it('deve rejeitar seeds.dark sem neutral', () => {
    // Test lança erro com mensagem clara
  });

  it('deve rejeitar seeds.dark sem accent', () => {
    // Test lança erro com mensagem clara
  });

  it('deve rejeitar config sem tokens.preset', () => {
    // Test lança erro
  });

  it('deve rejeitar preset desconhecido', () => {
    // Test com preset: 'unknown' lança erro
  });
});

describe('CLI - Integration', () => {
  it('deve criar config com init', async () => {
    // Test runInit em diretório limpo
    // Verificar que arquivo foi criado
  });

  it('deve rejeitar init sem --force quando config existe', async () => {
    // Test runInit com arquivo existente lança erro
  });

  it('deve sobrescrever com --force', async () => {
    // Test runInit com --force sobrescreve arquivo
  });

  it('deve executar build com config válido', async () => {
    // Test runBuild cria tokens.css, tokens.json, tokens.ts, tokens.d.ts
  });

  it('deve criar report quando flag --report presente', async () => {
    // Test runBuild com --report cria report.md
  });
});
```

---

### 4. Types hardcoded em `.d.ts`

**Arquivo**: `src/cli.ts` (linha 159)

**Problema**: Todo o conteúdo do arquivo `.d.ts` está hardcoded como string literal. Isso dificulta manutenção pois deve ser sincronizado manualmente com a estrutura real dos tokens.

**Código atual**:
```typescript
const dtsContents = `export type TokenValue = {\n  value: string;\n  srgb?: string;\n  p3?: string;\n  oklch?: string;\n  alpha: number;\n  meta?: Record<string, unknown>;\n};\n\nexport type TokensByContext = {\n  light: Record<string, TokenValue>;\n  dark: Record<string, TokenValue>;\n};\n\nexport declare const tokens: TokensByContext;\nexport declare const tokenNames: readonly string[];\nexport type TokenName = (typeof tokenNames)[number];\nexport type ExportMeta = {\n  gamutMapping: string;\n  preferSpace: string;\n  includeSpaces: string[];\n  precision: { l: number; c: number; h: number; alpha: number };\n  srgbFormat: string;\n  strict: boolean;\n};\nexport declare const meta: ExportMeta | undefined;\n`;
```

**Correção**: Extrair para template ou gerar programaticamente. Opção 1 (mais simples):

```typescript
// No topo do arquivo, criar constante
const DTS_TEMPLATE = `export type TokenValue = {
  value: string;
  srgb?: string;
  p3?: string;
  oklch?: string;
  alpha: number;
  meta?: Record<string, unknown>;
};

export type TokensByContext = {
  light: Record<string, TokenValue>;
  dark: Record<string, TokenValue>;
};

export declare const tokens: TokensByContext;
export declare const tokenNames: readonly string[];
export type TokenName = (typeof tokenNames)[number];
export type ExportMeta = {
  gamutMapping: string;
  preferSpace: string;
  includeSpaces: string[];
  precision: { l: number; c: number; h: number; alpha: number };
  srgbFormat: string;
  strict: boolean;
};
export declare const meta: ExportMeta | undefined;
`;

// Usar na função
const dtsContents = DTS_TEMPLATE;
```

Opção 2 (melhor, mas mais complexo): Gerar baseado na estrutura de `exportThemeJson`.

---

## 🟡 Melhorias Importantes (Devem ser corrigidas)

### 5. Tratamento de argumento desconhecido

**Arquivo**: `src/cli.ts` (linha 61)

**Problema**: Lança erro que é capturado no catch genérico. Deveria mostrar help imediatamente.

**Código atual**:
```typescript
throw new Error(`Unknown argument: ${value}`);
```

**Correção**:
```typescript
console.error(`Unknown argument: ${value}`);
console.error("");
printHelp();
process.exit(1);
```

---

### 6. Inconsistência de pontuação em mensagens de erro

**Arquivo**: `src/cli.ts` (linha 191)

**Problema**: Esta mensagem tem ponto final, mas outras mensagens não têm (linhas 117, 120, 123, 126, 129, 251).

**Código atual**:
```typescript
throw new Error(`Config already exists at ${filePath}. Use --force to overwrite.`);
```

**Correção**:
```typescript
throw new Error(`Config already exists at ${filePath}. Use --force to overwrite`);
```

---

### 7. Falta JSDoc em tipos exportados

**Arquivo**: `src/cli/config.ts`

**Problema**: Tipos e funções exportados não têm JSDoc completo, violando os critérios gerais de DX.

**Correção**:

```typescript
/**
 * Valid token preset names for the CLI configuration.
 * 
 * Available presets:
 * - `minimal-ui`: Minimal set of tokens for simple interfaces
 * - `radixLike-ui`: Radix-inspired semantic tokens
 * - `modern-ui`: Comprehensive modern UI token set
 */
export type TokenPresetName = "minimal-ui" | "radixLike-ui" | "modern-ui";

/**
 * Configuration for Palette Kit CLI.
 * 
 * This configuration is used by `palette-kit build` to generate
 * color tokens in multiple formats (CSS, JSON, TypeScript).
 * 
 * @example
 * ```typescript
 * import type { PaletteConfig } from "palette-kit";
 * 
 * const config: PaletteConfig = {
 *   theme: {
 *     seeds: {
 *       light: { neutral: "#8B8D98", accent: "#3D63DD" },
 *       dark: { neutral: "#8B8D98", accent: "#3D63DD" },
 *     },
 *     preset: "modern",
 *   },
 *   tokens: {
 *     preset: "modern-ui",
 *   },
 *   output: {
 *     preferSpace: "oklch",
 *     includeSpaces: ["srgb", "p3"],
 *   },
 * };
 * 
 * export default config;
 * ```
 */
export type PaletteConfig = {
  /**
   * Theme inputs for palette generation (seed colors + optional variants).
   */
  theme: ThemeConfig;
  /**
   * Token preset selection for exporters/CLI.
   */
  tokens: {
    /**
     * Name of the token preset to use.
     * 
     * Determines which semantic tokens are generated.
     */
    preset: TokenPresetName;
  };
  /**
   * Exporter options (formatting, gamut mapping, precision).
   * 
   * Controls how colors are serialized in CSS and JSON outputs.
   */
  output?: OutputOptions;
};

/**
 * Generates a typed configuration file template.
 * 
 * Creates a TypeScript config file that imports types from the specified
 * package and provides a starter configuration with default values.
 * 
 * @param packageName - The name of the package to import types from
 * @returns TypeScript source code for the config file
 * 
 * @example
 * ```typescript
 * const template = buildConfigTemplate("palette-kit");
 * await writeFile("palette.config.ts", template);
 * ```
 */
export const buildConfigTemplate = (
  packageName: string,
) => `import type { PaletteConfig } from "${packageName}";
// ... resto do template
`;

/**
 * Type guard to validate if a string is a valid token preset name.
 * 
 * @param value - String to validate
 * @returns `true` if the value is a valid TokenPresetName
 * 
 * @example
 * ```typescript
 * if (isTokenPresetName(userInput)) {
 *   // userInput is now typed as TokenPresetName
 *   const tokens = tokenPresetMap[userInput];
 * }
 * ```
 */
export const isTokenPresetName = (value: string): value is TokenPresetName =>
  value === "minimal-ui" || value === "radixLike-ui" || value === "modern-ui";
```

---

## 🟢 Melhorias Futuras (Podem ser feitas em outro PR)

### 8. Extrair defaults para constantes

**Arquivo**: `src/cli.ts` (linhas 201-202)

**Sugestão**: Extrair valores default para constantes no topo do arquivo para facilitar manutenção.

```typescript
const DEFAULT_CONFIG_PATH = "palette.config.ts";
const DEFAULT_OUT_DIR = "dist/palette";

// Usar nas funções:
const configPath = typeof flags.config === "string" ? flags.config : DEFAULT_CONFIG_PATH;
const outDir = resolve(typeof flags.outDir === "string" ? flags.outDir : DEFAULT_OUT_DIR);
```

---

### 9. Melhorar DX com configs TypeScript

**Arquivo**: `src/cli.ts` (linhas 107-108, 201)

**Problema**: O default é `.ts` mas requer tsx/ts-node, causando erro imediato para novos usuários.

**Sugestões**:
- Opção A: Mudar default para `.mjs` ou `.js`
- Opção B: Detectar se tsx está disponível e sugerir instalação
- Opção C: Documentar claramente no README que tsx é necessário

---

### 10. Testes de integração end-to-end

**Sugestão**: Adicionar testes que executam o CLI como processo externo para validar:
- Saída do help (`palette-kit --help`)
- Saída da versão (`palette-kit --version`)
- Fluxo completo: `init` → editar config → `build`
- Validação dos arquivos gerados

---

## Checklist de Implementação

Use este checklist para acompanhar o progresso:

- [ ] **1. Corrigir tratamento de erro em `main()`** (remover `printHelp()` do catch)
- [ ] **2. Implementar validação completa de `seeds.light/dark.neutral/accent`**
- [ ] **3. Criar `src/cli.test.ts`** com testes mínimos
  - [ ] Testes de `parseArgs`
  - [ ] Testes de `validateConfig`
  - [ ] Testes de `runInit`
  - [ ] Testes de `runBuild`
- [ ] **4. Refatorar types hardcoded do `.d.ts`** (extrair para constante ou gerar)
- [ ] **5. Corrigir tratamento de argumento desconhecido** (mostrar help imediatamente)
- [ ] **6. Padronizar pontuação** (remover ponto final da linha 191)
- [ ] **7. Adicionar JSDoc completo** em `src/cli/config.ts`
- [ ] Executar `npm run build` para validar
- [ ] Executar `npm test` para validar todos os testes
- [ ] Executar `npm run lint` para validar estilo
- [ ] Executar `npm run typecheck` para validar tipos

---

## Resultado Esperado

Após as correções:

✅ Todos os critérios gerais do guia de revisão v0.3 atendidos  
✅ Todos os critérios da Fase 6 atendidos  
✅ Nenhum blocker remanescente  
✅ Testes passando  
✅ Build limpo  
✅ DX melhorado  

**Status Final Esperado**: ✅ **APPROVED**

---

## Referências

- Guia de revisão: `.github/skills/copilot-review-guide/references/copilot-review-guide-v0.3.md`
- Spec v0.3: `src/planning/spec-v0.3.md`
- Roadmap v0.3: `src/planning/roadmap-v0.3.md`
- PR original: https://github.com/claushaas/palette-kit/pull/26
