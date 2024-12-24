import { BaseFilter } from "../../filters/BaseFilter";
import { TextureInfo } from "../texture/TextureInfo";

/**
 * Class for texture transform properties of filters
 * @property {TextureInfo} texture
 */
export class FilterTextureTransformProps {
  /**
   * Creates an instance of FilterTextureTransformProps.
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
    translateX = 0,
    translateY = 0,
    cropX = 0,
    cropY = 0,
    cropWidth = 1,
    cropHeight = 1
  ) {
    this._filter = filter;

    this.texture = texture;
    this.translateX = translateX;
    this.translateY = translateY;
    this.cropX = cropX;
    this.cropY = cropY;
    this.cropWidth = cropWidth;
    this.cropHeight = cropHeight;
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
