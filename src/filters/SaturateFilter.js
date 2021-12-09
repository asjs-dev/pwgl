import { arraySet } from "../utils/helpers.js";
import { BaseFilter } from "./BaseFilter.js";

export class SaturateFilter extends BaseFilter {
  constructor(intensity) {
    super(2, 0, intensity);
  }

  set intensity(v) {
    this.v[0] = v;

    const x = (v * 2 / 3) + 1;
    const y = ((x - 1) * - .5);

    arraySet(this.kernels, [
      x, y, y, 0,
      y, x, y, 0,
      y, y, x, 0
    ], 0);
  }
}
