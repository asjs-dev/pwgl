import { arraySet } from "../utils/helpers.js";
import "../namespace.js";
import "./BaseFilter.js";

AGL.SaturateFilter = class extends AGL.BaseFilter {
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
