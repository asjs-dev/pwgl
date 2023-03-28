import { BaseFilter } from "./BaseFilter";

/**
 * Invert filter
 * @extends {BaseFilter}
 */
export class InvertFilter extends BaseFilter {
  /**
   * Creates an instance of InvertFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(3, 3, intensity);
  }
}
