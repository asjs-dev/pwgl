import { fract } from "./fract";

let hash = 1;

/** Step noise function. */
export const stepNoise = (x: number, y: number, seed = 1): number =>
  (hash = Math.abs(fract(hash * (0.12 + 34.56 * x + seed * y * 78.9))));
