# Overlays

Overlays are translucent layers meant to add depth, focus, and separation without changing between light and dark themes. They are not theme colors; they are optical tools.

## Concept

Radix defines two overlay scales:

- Black Alpha: black with varying alpha.
- White Alpha: white with varying alpha.

The RGB stays fixed (pure black or pure white). Only the alpha changes, so the same overlay works over any background. This keeps perceived depth consistent across themes.

## Scale

Steps go from 1 to 12:

- 1-3: barely visible
- 4-6: subtle
- 7-9: clear
- 10-12: maximum weight

## When to use

- Black Alpha: darkens what is behind (modal backdrops, pressed states, focus emphasis).
- White Alpha: lightens or highlights surfaces (hover on dark surfaces, soft highlights).

## Why overlays do not change with themes

Overlays communicate depth, not identity. If they changed between themes, the same action would feel stronger or weaker depending on the mode. Keeping alpha stable preserves consistent perception.

## Practical rules

- Modal backdrop: Black Alpha 9-11
- Subtle hover: White Alpha 3-5 (dark) / Black Alpha 3-5 (light)
- Pressed/active: move up 1-2 steps
- Soft separation or fake shadow: Alpha 1-2

## Visual references

- <https://www.radix-ui.com/colors/docs/palette-composition/scales>
- <https://europe1.discourse-cdn.com/unity/original/4X/d/1/e/d1ea3c16e9b52b3ea5c56887a122ad81d8405ae5.png>
- <https://i.sstatic.net/njwGd.png>
- <https://i.sstatic.net/ODQvN.png>
- <https://weblog.west-wind.com/images/2020/Bootstrap-Modal-showing-under-Modal-Background/BootstrapModalFail.png>
