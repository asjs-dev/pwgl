import { FilterTextureTransformProps } from "../data/props/FilterTextureTransformProps";
import { BaseFilter } from "./BaseFilter";

/**
 * Displacement filter
 * @extends {BaseFilter}
 */
export class DisplacementFilter extends BaseFilter {
  /**
   * Creates an instance of DisplacementFilter.
   * @constructor
   * @param {number} texture
   * @param {number} intensity
   * @param {number} translateX
   * @param {number} translateY
   * @param {number} cropX
   * @param {number} cropY
   * @param {number} cropWidth
   * @param {number} cropHeight
   */
  constructor(
    texture,
    intensity,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    super(6, 0, intensity);

    this.textureTransform = new FilterTextureTransformProps(
      this,
      texture,
      translateX,
      translateY,
      cropX,
      cropY,
      cropWidth,
      cropHeight
    );
  }
}
