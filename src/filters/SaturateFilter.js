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
  constructor(intensity, mix = 1) {
    super(2, 0, intensity);

    this.mix = mix;
  }

  /**
   * Set intensity
   * @type {number}
   */
  set intensity(v) {
    this.v[0] = v;
    const sv = 1 - v,
      svr = sv * 0.3,
      svg = sv * 0.59,
      svb = sv * 0.11;

    // prettier-ignore
    arraySet(this.kernels, [
      svr + v, svg, svb, 0,
      svr, svg + v, svb, 0,
      svr, svg, svb + v, 0
    ], 0);
  }
}
