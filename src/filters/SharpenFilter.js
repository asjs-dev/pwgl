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
   */
  constructor(intensity) {
    super(1, 0, intensity);

    // prettier-ignore
    arraySet(this.kernels, [
      -1,  -1,  -1,
      -1,  16,  -1,
      -1,  -1,  -1
    ], 0);
  }
}
