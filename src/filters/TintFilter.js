import { BaseFilter } from "./BaseFilter";

/**
 * Tint filter
 * @extends {BaseFilter}
 */
export class TintFilter extends BaseFilter {
  /**
   * Creates an instance of TintFilter.
   * @constructor
   * @param {number} intensity
   * @param {number} r
   * @param {number} g
   * @param {number} b
   */
  constructor(intensity, r, g, b) {
    super(3, 4, intensity);

    this.r = r;
    this.g = g;
    this.b = b;
  }
}
