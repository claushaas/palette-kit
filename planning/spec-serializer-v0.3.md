# Palette Kit — SPEC Técnica do Serializer (v0.3)

> Documento técnico que especifica em detalhe o Serializer público da v0.3.
> Esta é a parte mais sensível da arquitetura, pois define o contrato entre o resolver matemático
> e os outputs consumíveis (CSS, React Native, JSON, etc.).

## 1. Papel do Serializer na arquitetura

O Serializer é a camada de fronteira entre:

- o core matemático do Palette Kit (resolver em OKLCH)
- os formatos finais exigidos por plataformas reais

Ele não decide cores, não resolve semântica e não altera intenção visual.
Sua função é transformar dados já resolvidos em representações utilizáveis.

## 2. Princípios fundamentais

1. Pureza
   - Serializar não deve alterar a cor semanticamente.
   - Ajustes só ocorrem por gamut mapping explícito.
2. Previsibilidade
   - Mesma entrada + mesmas opções = mesma saída.
   - Ordem de propriedades determinística.
3. DX explícita
   - Nada é automágico.
   - Toda decisão relevante é configurável ou documentada.
4. Separação de responsabilidades
   - Resolver -> decide cor.
   - Serializer -> decide formato.

## 3. Entradas suportadas

### 3.1 OKLCH channels

```ts
type OklchChannels = {
  l: number
  c: number
  h: number
  alpha?: number
}
```

- Representa o contrato matemático base.
- Usado diretamente por `serializeColor`.

### 3.2 BaseResolvedColor

```ts
{
  oklch: OklchChannels
  step: number
  variantUsed: string
  seedUsed: string
}
```

- Shape estável garantido na linha v0.x.
- Usado por `serializeResolved`.

### 3.3 ColorQuery (atalho DX)

```ts
serialize(theme, query, options)
```

- Combina:
  1. `theme.resolve(query)`
  2. `serializeResolved(...)`

## 4. APIs públicas

### 4.1 serializeColor

```ts
serializeColor(
  oklch: OklchChannels,
  options?: SerializeOptions
): ResolvedColor
```

Uso:

- casos de baixo nível
- integrações customizadas
- testes

### 4.2 serializeResolved

```ts
serializeResolved(
  color: BaseResolvedColor,
  options?: SerializeOptions
): ResolvedColor
```

Uso:

- caminho padrão após `resolve`
- preserva meta do resolver

### 4.3 theme.serialize

```ts
theme.serialize(
  query: ColorQuery,
  options?: SerializeOptions
): ResolvedColor
```

Uso:

- caminho DX máximo
- menos boilerplate

## 5. SerializeOptions

```ts
type SerializeOptions = {
  preferSpace?: "oklch" | "srgb" | "p3"
  includeSpaces?: Array<"oklch" | "srgb" | "p3">
  precision?: {
    l?: number
    c?: number
    h?: number
    alpha?: number
  }
  gamutMapping?: "clip" | "compressChroma" | "preferP3ThenCompress"
  strict?: boolean
  includeMeta?: boolean
}
```

### Defaults obrigatórios

| Opção | Default |
| --- | --- |
| preferSpace | "oklch" |
| gamutMapping | "preferP3ThenCompress" |
| precision | { l: 1, c: 3, h: 1, alpha: 2 } |
| strict | false |
| includeMeta | false |

## 6. Saída: ResolvedColor

```ts
type ResolvedColor = {
  value: string
  alpha: number
  oklch?: string
  srgb?: string
  p3?: string
  meta?: ColorMeta
}
```

### Regras

- `value`:
  - sempre presente
  - corresponde a `preferSpace`
- Outros espaços:
  - só incluídos se listados em `includeSpaces`
- `alpha`:
  - sempre normalizado `[0..1]`

## 7. Espaços de cor

### 7.1 OKLCH

Formato:

```css
oklch(L% C H / A)
```

Regras:

- L sempre em `%`
- C com precisão configurável
- H normalizado `[0..360)`

### 7.2 sRGB

Formatos aceitos:

- `#RRGGBB`
- `rgb(r g b)`
- `rgba(r g b / a)`

Regras:

- Preferir `hex` por default
- `rgb/rgba` apenas se explicitado

### 7.3 Display-P3

Formato:

```css
color(display-p3 r g b / a)
```

Regras:

- Valores normalizados `[0..1]`
- Só emitido se:
  - solicitado
  - gamutMapping permitir

## 8. Gamut Mapping

### Estratégias

#### clip

- Corta valores fora do gamut
- Pode distorcer percepção
- Só recomendado para debug

#### compressChroma

- Reduz C mantendo L/H
- Preserva intenção perceptual
- Estratégia segura

#### preferP3ThenCompress (default)

1. Tenta P3
2. Se falhar, comprime C
3. Nunca clippa sem aviso

## 9. Precision e arredondamento

- Arredondamento ocorre no final
- Nunca durante cálculos intermediários
- Evita drift cumulativo

## 10. Strict mode

### strict = false (default)

- Best-effort
- Warnings em casos limite
- Nunca lança erro fatal

### strict = true

- Erros lançados quando:
  - conversão falha
  - gamut impossível
  - parâmetros inválidos

Mensagens devem ser:

- claras
- acionáveis
- sem jargon matemático

## 11. Meta e diagnósticos

Se `includeMeta: true`, incluir:

```ts
meta: {
  spaceUsed: "oklch" | "srgb" | "p3"
  gamutMapping: string
  clipped?: boolean
  compressed?: boolean
}
```

Meta nunca influencia `value`.

## 12. Ordem interna do algoritmo

1. Receber entrada
2. Normalizar alpha
3. Converter OKLCH -> espaço alvo
4. Aplicar gamut mapping
5. Arredondar canais
6. Gerar strings
7. Montar `ResolvedColor`

## 13. Testes obrigatórios

### Unitários

- Cada espaço isoladamente
- Cada estratégia de gamut

### Snapshot

- Serializações completas
- Comparação determinística

### DX

- Autocomplete
- JSDoc visível no editor

## 14. Critérios de aceite

- Serializer não altera intenção visual
- API estável e previsível
- Erros claros em strict mode
- Funciona isoladamente do core

## 15. Anti‑padrões explícitos

- Resolver dentro do serializer
- Decidir contraste
- Ajustar L/H sem pedido explícito
- Comportamento implícito não documentado

## Status

SPEC técnica fechada e pronta para implementação.

Próximo passo natural:

- dividir essa spec em PRs pequenos
- ou iniciar implementação começando por `serializeColor`
