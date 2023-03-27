import { BaseFilter } from "./BaseFilter";

/**
 * Grayscale filter
 * @extends {BaseFilter}
 */
export class GrayscaleFilter extends BaseFilter {
  /**
   * Creates an instance of GrayscaleFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(3, 1, intensity);
  }
}
