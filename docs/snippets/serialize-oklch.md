# Serialize OKLCH

```ts
const toOklch = (c: { l: number; c: number; h: number; alpha?: number }) => {
  const a = c.alpha ?? 1;
  const alphaPart = a < 1 ? ` / ${a}` : "";
  return `oklch(${c.l}% ${c.c} ${c.h}${alphaPart})`;
};
```
