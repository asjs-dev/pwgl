import { BaseFilter } from "./BaseFilter";

/**
 * Rainbow filter
 * @extends {BaseFilter}
 */
export class RainbowFilter extends BaseFilter {
  /**
   * Creates an instance of RainbowFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(3, 7, intensity);
  }
}
