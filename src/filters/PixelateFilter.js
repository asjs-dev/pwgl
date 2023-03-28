import { BaseFilter } from "./BaseFilter";

/**
 * Pixelate filter
 * @extends {BaseFilter}
 */
export class PixelateFilter extends BaseFilter {
  /**
   * Creates an instance of PixelateFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(5, 0, intensity);
  }
}
