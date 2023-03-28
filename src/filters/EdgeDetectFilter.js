import { arraySet } from "../utils/helpers";
import { BaseFilter } from "./BaseFilter";

/**
 * Edge detect filter
 * @extends {BaseFilter}
 */
export class EdgeDetectFilter extends BaseFilter {
  /**
   * Creates an instance of EdgeDetectFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(1, 0, intensity);

    // prettier-ignore
    arraySet(this.kernels, [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1
    ], 0);
  }
}
