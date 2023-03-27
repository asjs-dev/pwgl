import { BaseFilter } from "./BaseFilter";

/**
 * Sepia filter
 * @extends {BaseFilter}
 */
export class SepiaFilter extends BaseFilter {
  /**
   * Creates an instance of SepiaFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(3, 2, intensity);
  }
}
