# Tokens

The default preset is `radix-like-ui`. It provides a minimal, practical set of tokens.

## Base UI

- `bg.app` -> neutral 1
- `bg.subtle` -> neutral 2
- `surface.card` -> neutral 2
- `surface.raised` -> neutral 3
- `component.bg` -> neutral 3
- `component.bgHover` -> neutral 4
- `component.bgActive` -> neutral 5
- `border.subtle` -> neutral 6
- `border.default` -> neutral 7
- `border.strong` -> neutral 8
- `text.secondary` -> neutral 11
- `text.primary` -> neutral 12
- `text.disabled` -> neutral 10

## Accent

- `focus.ring` -> accent 8
- `accent.solid` -> accent 9
- `accent.solidHover` -> accent 10
- `accent.border` -> accent 7
- `accent.subtle` -> accent 3
- `accent.subtleHover` -> accent 4

## Status (optional)

Generated only if the scale exists.

- `status.success.solidBg` -> success 9
- `status.success.solidHover` -> success 10
- `status.success.subtleBg` -> success 3
- `status.success.border` -> success 7
- `status.success.text` -> success 11
- `status.success.textStrong` -> success 12

- `status.warning.solidBg` -> warning 9
- `status.warning.solidHover` -> warning 10
- `status.warning.subtleBg` -> warning 3
- `status.warning.border` -> warning 7
- `status.warning.text` -> warning 11
- `status.warning.textStrong` -> warning 12

- `status.danger.solidBg` -> danger 9
- `status.danger.solidHover` -> danger 10
- `status.danger.subtleBg` -> danger 3
- `status.danger.border` -> danger 7
- `status.danger.text` -> danger 11
- `status.danger.textStrong` -> danger 12

## On-solid

On-solid tokens are computed using contrast and alpha:

- `onSolid.primary`
- `onSolid.secondary`
- `onSolid.disabled`
