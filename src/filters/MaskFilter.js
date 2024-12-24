import { FilterTextureTransformProps } from "../data/props/FilterTextureTransformProps";
import { BaseFilter } from "./BaseFilter";

/**
 * Mask filter
 * @extends {BaseFilter}
 */
export class MaskFilter extends BaseFilter {
  /**
   * Creates an instance of MaskFilter.
   * @constructor
   * @param {number} texture
   * @param {number} type
   * @param {number} translateX
   * @param {number} translateY
   * @param {number} cropX
   * @param {number} cropY
   * @param {number} cropWidth
   * @param {number} cropHeight
   */
  constructor(
    texture,
    type,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    super(7, 0, type);

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

  /**
   * Set/Get type
   * @type {number}
   */
  get type() {
    return this.v[0];
  }
  set type(v) {
    this.v[0] = v;
  }
}

/**
 * Mask channel type
 * @member
 * @property {number} RED
 * @property {number} GREEN
 * @property {number} BLUE
 * @property {number} ALPHA
 */
MaskFilter.Type = {
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  ALPHA: 3,
  AVG: 4,
};
