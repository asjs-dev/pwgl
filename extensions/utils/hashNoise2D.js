import { fract } from "./fract";
import { dot } from "./dot";

/**
 * Hash-based 2D noise function
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @returns {number}
 */
export const hashNoise2D = (x, y, seed) =>
  fract(
    Math.sin(dot({ x, y }, { x: Math.sin(x + y), y: Math.cos(y - x) * seed })) *
      seed,
  ) *
    0.5 +
  0.5;
