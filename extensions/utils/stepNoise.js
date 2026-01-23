import { fract } from "./fract";

let hash = 1;
/**
 * Step noise function
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @returns {number}
 */
export const stepNoise = (x, y, seed) =>
  (hash = Math.abs(fract(hash * (0.12 + 34.56 * x + seed * y * 78.9))));