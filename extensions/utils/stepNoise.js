import { fract } from "./fract";

let hash = 1;
/**
 * Step noise function
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Seed value
 * @returns {number}
 */
export const stepNoise = (x, y, seed) =>
  (hash = Math.abs(fract(hash * (0.12 + 34.56 * x + seed * y * 78.9))));