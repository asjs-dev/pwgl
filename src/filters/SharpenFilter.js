import { arraySet } from "../utils/helpers";
import { BaseFilter } from "./BaseFilter";

/**
 * Sharpen filter
 * @extends {BaseFilter}
 */
export class SharpenFilter extends BaseFilter {
  /**
   * Creates an instance of SharpenFilter.
   * @constructor
   * @param {number} intensity
   * @param {number} mix
   */
  constructor(intensity, mix = 1) {
    super(1, 0, intensity);

    this.mix = mix;

    // prettier-ignore
    arraySet(this.kernels, [
      0, -1,  0,
     -1,  5, -1,
      0, -1,  0,
    ], 0);
  }
}
