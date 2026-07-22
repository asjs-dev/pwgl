import { dot } from "./dot";
import { fract } from "./fract";

/** Hash-based 2D noise function. */
export const hashNoise2D = (x: number, y: number, seed = 1): number =>
  fract(Math.sin(dot({ x, y }, { x: Math.sin(x + y), y: Math.cos(y - x) * seed })) * seed) * 0.5 + 0.5;
