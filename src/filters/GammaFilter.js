import { BaseFilter } from "./BaseFilter";

/**
 * Gamma filter
 * @extends {BaseFilter}
 */
export class GammaFilter extends BaseFilter {
  /**
   * Creates an instance of GammaFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity) {
    super(3, 9, intensity);
  }
}
