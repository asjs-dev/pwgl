import { BaseFilter } from "./BaseFilter";
import { FilterTextureTransformProps } from "../data/props/FilterTextureTransformProps";

/**
 * Base Texture filter
 * @extends {BaseFilter}
 */
export class BaseTextureFilter extends BaseFilter {
  /**
   * Creates an instance of BaseTextureFilter.
   * @constructor
   * @param {number} texture
   * @param {number} extendedValue
   * @param {number} translateX
   * @param {number} translateY
   * @param {number} cropX
   * @param {number} cropY
   * @param {number} cropWidth
   * @param {number} cropHeight
   */
  constructor(
    texture,
    extendedValue,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    super(extendedValue);

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

// prettier-ignore
BaseTextureFilter.$createGLSL = (core) => "" +
  "vec4 " +
    "mskCl=texture(" +
      "uFTex," +
      "mod(vec2(vl[1],vl[2])+vTUv,1.)*vec2(vl[5]-vl[3],vl[6]-vl[4])" +
    ");" +
  core;
