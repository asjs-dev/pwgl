import { dot } from "./dot";
import { fract } from "./fract";

export const rand = (x, y, seed) =>
  fract(
    Math.sin(dot([x, y], [Math.sin(x + y), Math.cos(y - x) * seed])) * seed
  ) *
    0.5 +
  0.5;
