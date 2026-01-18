# Alpha

Alpha handling in v0.2 is controlled by `AlphaStrategy` in `ColorQuery` and `OnSolidQuery`.

## AlphaStrategy

```ts
type AlphaStrategy =
  | { mode: "none" }
  | { mode: "fixed"; alpha: number }
  | { mode: "solveOnBackground" };
```

## `onSolid` behavior

`engine/onSolid.ts` implements fixed alpha defaults for text/icon:

- `text`: `0.92`
- `icon`: `0.72`

If `alpha.mode` is `fixed`, that value is validated to `[0..1]`.

`alpha.mode: "solveOnBackground"` is **not supported** in `onSolid`:

- In strict mode: throws an error.
- In non-strict mode: logs a warning and falls back to the fixed defaults above.

### Example

```ts
const text = theme.onSolid({
  bgRole: "action.primary",
  usage: "text",
  context: "light",
  alpha: { mode: "fixed", alpha: 0.9 },
});
```
