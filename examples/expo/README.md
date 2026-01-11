# Expo Example

This example shows how to use Palette Kit with React Native + Expo.

## Setup

From this folder:

```bash
npm install
npx expo start
```

## Notes

- The example uses `@claus/palette-kit` directly.
- It creates a theme, exports a React Native palette, and applies tokens.
- Dark mode is selected via `useColorScheme()`.
- Note: React Native does not support `color(display-p3 ...)` strings as drop-in colors. Keep P3 data for native APIs or use sRGB.
