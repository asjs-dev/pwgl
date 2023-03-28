import { BaseFilter } from "./BaseFilter";

/**
 * Color limit filter
 * @extends {BaseFilter}
 */
export class ColorLimitFilter extends BaseFilter {
  /**
   * Creates an instance of ColorLimitFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(3, 5, intensity);
  }
}
