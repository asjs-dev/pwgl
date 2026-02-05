import { BaseFilter } from "./BaseFilter";
import { TextureInfo } from "../textures/TextureInfo";

/**
 * Base Texture filter
 * @extends {BaseFilter}
 */
export class BaseTextureFilter extends BaseFilter {
  /**
   * Creates an instance of BaseTextureFilter.
   * @constructor
   * @param {object} options
   * @param {TextureInfo} options.texture
   * @param {number} translateX
   * @param {number} translateY
   * @param {number} cropX
   * @param {number} cropY
   * @param {number} cropWidth
   * @param {number} cropHeight
   */
  constructor(options = {}) {
    super(options);

    this.texture = options.texture;
    this.translateX = options.translateX ?? 0;
    this.translateY = options.translateY ?? 0;
    this.cropX = options.cropX ?? 0;
    this.cropY = options.cropY ?? 0;
    this.cropWidth = options.cropWidth ?? 1;
    this.cropHeight = options.cropHeight ?? 1;
  }

  /**
   * Set/Get translate x
   * @type {number}
   */
  get translateX() {
    return this.customData[0];
  }
  set translateX(v) {
    this.customData[0] = v;
  }

  /**
   * Set/Get translate y
   * @type {number}
   */
  get translateY() {
    return this.customData[1];
  }
  set translateY(v) {
    this.customData[1] = v;
  }

  /**
   * Set/Get crop x
   * @type {number}
   */
  get cropX() {
    return this.customData[2];
  }
  set cropX(v) {
    this.customData[2] = v;
  }

  /**
   * Set/Get crop y
   * @type {number}
   */
  get cropY() {
    return this.customData[3];
  }
  set cropY(v) {
    this.customData[3] = v;
  }

  /**
   * Set/Get crop width
   * @type {number}
   */
  get cropWidth() {
    return this.customData[4];
  }
  set cropWidth(v) {
    this.customData[4] = v;
  }

  /**
   * Set/Get crop height
   * @type {number}
   */
  get cropHeight() {
    return this.customData[5];
  }
  set cropHeight(v) {
    this.customData[5] = v;
  }
}

// prettier-ignore
BaseTextureFilter.$createGLSL = (core) => "" +
  "vec4 " +
    "txCl=texture(" +
      "uH," +
      "mod(vec2(uL[0].x,uL[0].y)+v0.zw,1.)*vec2(uL[1].x-uL[0].z,uL[1].y-uL[0].w)" +
    ");" +
  core;
