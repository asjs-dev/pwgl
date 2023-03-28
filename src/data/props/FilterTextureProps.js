import { BaseFilter } from "../../filters/BaseFilter";
import { TextureInfo } from "../texture/TextureInfo";

/**
 * Class for texture properties of filters
 */
export class FilterTextureProps {
  /**
   * Creates an instance of FilterTextureProps.
   * @constructor
   * @param {BaseFilter} filter
   * @param {TextureInfo} texture
   * @param {number} translateX
   * @param {number} translateY
   * @param {number} cropX
   * @param {number} cropY
   * @param {number} cropWidth
   * @param {number} cropHeight
   */
  constructor(
    filter,
    texture,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    this._filter = filter;
    this.texture = texture;
    this.translateX = translateX || 0;
    this.translateY = translateY || 0;
    this.cropX = cropX || 0;
    this.cropY = cropY || 0;
    this.cropWidth = cropWidth || 1;
    this.cropHeight = cropHeight || 1;
  }

  /**
   * Set/Get translate x
   * @type {number}
   */
  get translateX() {
    return this._filter.v[1];
  }
  set translateX(v) {
    this._filter.v[1] = v;
  }

  /**
   * Set/Get translate y
   * @type {number}
   */
  get translateY() {
    return this._filter.v[2];
  }
  set translateY(v) {
    this._filter.v[2] = v;
  }

  /**
   * Set/Get crop x
   * @type {number}
   */
  get cropX() {
    return this._filter.v[3];
  }
  set cropX(v) {
    this._filter.v[3] = v;
  }

  /**
   * Set/Get crop y
   * @type {number}
   */
  get cropY() {
    return this._filter.v[4];
  }
  set cropY(v) {
    this._filter.v[4] = v;
  }

  /**
   * Set/Get crop width
   * @type {number}
   */
  get cropWidth() {
    return this._filter.v[5];
  }
  set cropWidth(v) {
    this._filter.v[5] = v;
  }

  /**
   * Set/Get crop height
   * @type {number}
   */
  get cropHeight() {
    return this._filter.v[6];
  }
  set cropHeight(v) {
    this._filter.v[6] = v;
  }
}
