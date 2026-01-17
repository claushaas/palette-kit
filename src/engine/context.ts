import type { ColorContext } from "../types/index.js";
import type { NormalizedQuery } from "./normalize.js";

export type EngineContext = "light" | "dark";

export const mapColorContextToEngine = (
  context: ColorContext | NormalizedQuery["context"],
): EngineContext => (context === "dark" || context === "dimmed" ? "dark" : "light");
