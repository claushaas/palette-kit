# Text

Text and icon colors are primarily handled by `theme.onSolid`, which solves for contrast against a solid background.

## Defaults (from code)

`engine/onSolid.ts` uses APCA by default with target Lc:

- `text`: `75`
- `icon`: `60`

You can override this via `contrast` in `OnSolidQuery`.

## Example

```ts
const text = theme.onSolid({
  bgRole: "action.primary",
  usage: "text",
  context: "light",
  contrast: { model: "apca", targetLc: 80 },
});
```

## WCAG2 fallback

You can request WCAG2 using:

```ts
const icon = theme.onSolid({
  bgRole: "action.primary",
  usage: "icon",
  context: "light",
  contrast: { model: "wcag2", minRatio: 4.5 },
});
```
