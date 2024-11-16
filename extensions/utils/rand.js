import { fract } from "./fract";

let hash = 1;
const rand = (x, y, seed) =>
  (hash = Math.abs(fract(hash * (0.12 + 34.56 * x + seed * y * 78.9))));

const fixRand = (x, y, seed) =>
  fract(
    Math.sin(dot({ x, y }, { x: Math.sin(x + y), y: Math.cos(y - x) * seed })) *
      seed
  ) *
    0.5 +
  0.5;

export const random = {
  rand,
  fixRand,
};
