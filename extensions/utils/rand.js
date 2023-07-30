import { fract } from "./fract";

let hash = 1;
export const rand = (x, y, seed) => {
  return (hash = Math.abs(fract(hash * (.12 + 34.56 * x + seed * y * 78.9))));
};