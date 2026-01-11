import Color from "colorjs.io";

import type { ColorHex, ColorP3, OklchColor } from "../types.js";

export function hexToOklch(hex: ColorHex): OklchColor {
  const color = new Color(hex).to("oklch");
  const [l, c, h] = color.coords;
  return { l: l ?? 0, c: c ?? 0, h: h ?? 0 };
}

export function oklchToHex(oklch: OklchColor): ColorHex {
  const color = new Color("oklch", [oklch.l, oklch.c, oklch.h]);
  return color.to("srgb").toString({ format: "hex" }) as ColorHex;
}

export function inSrgbGamut(oklch: OklchColor): boolean {
  const color = new Color("oklch", [oklch.l, oklch.c, oklch.h]);
  return color.inGamut("srgb");
}

export function compressToSrgb(oklch: OklchColor): OklchColor {
  let current = { ...oklch };
  let iterations = 0;

  while (!inSrgbGamut(current) && current.c > 0 && iterations < 40) {
    current = { ...current, c: current.c * 0.95 };
    iterations += 1;
  }

  return current;
}

export function inP3Gamut(oklch: OklchColor): boolean {
  const color = new Color("oklch", [oklch.l, oklch.c, oklch.h]);
  return color.inGamut("p3");
}

export function compressToP3(oklch: OklchColor): OklchColor {
  let current = { ...oklch };
  let iterations = 0;

  while (!inP3Gamut(current) && current.c > 0 && iterations < 40) {
    current = { ...current, c: current.c * 0.95 };
    iterations += 1;
  }

  return current;
}

export function oklchToP3(oklch: OklchColor): ColorP3 {
  const color = new Color("oklch", [oklch.l, oklch.c, oklch.h]);
  return color.to("p3").toString({ format: "color" }) as ColorP3;
}
