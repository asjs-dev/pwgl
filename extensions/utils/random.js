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
      seed
  ) *
    0.5 +
  0.5;