import { BaseFilter } from "./BaseFilter";

/**
 * Glow filter
 * @extends {BaseFilter}
 */
export class GlowFilter extends BaseFilter {
  /**
   * Creates an instance of GlowFilter.
   * @constructor
   * @param {number} intensityX
   * @param {number} intensityY
   */
  constructor(intensityX, intensityY) {
    super(4, 2, intensityX);

    this.intensityY = intensityY;
  }
}
