import { arraySet } from "../utils/helpers";
import { BaseFilter } from "./BaseFilter";

/**
 * Saturate filter
 * @extends {BaseFilter}
 */
export class SaturateFilter extends BaseFilter {
  /**
   * Creates an instance of SaturateFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(2, 0, intensity);
  }

  /**
   * Set intensity
   * @type {number}
   */
  set intensity(v) {
    this.v[0] = v;

    const x = (v * 2) / 3 + 1;
    const y = -(x - 1) / 2;

    // prettier-ignore
    arraySet(this.kernels, [
      x, y, y, 0,
      y, x, y, 0,
      y, y, x, 0
    ], 0);
  }
}
