import { noop } from "../../../extensions/utils/noop";
import "../../geom/RectangleType";

/**
 * Class for texture crop properties
 * @property {boolean} updated
 * @property {Array<number>} cache
 * @property {function} update
 */
export class TextureCrop {
  /**
   * Creates an instance of TextureCrop.
   * @constructor
   */
  constructor() {
    this.cache = [0, 0, 1, 1];
    this._updateCacheFv = this._updateCache;
    this._width = this._height = 1;
  }

  /**
   * Set/Get x
   * @type {number}
   */
  get x() {
    return this.cache[0];
  }
  set x(v) {
    this.cache[0] = v;
    this._updateCacheFv = this._updateCache;
  }

  /**
   * Set/Get y
   * @type {number}
   */
  get y() {
    return this.cache[1];
  }
  set y(v) {
    this.cache[1] = v;
    this._updateCacheFv = this._updateCache;
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this._width;
  }
  set width(v) {
    this._width = v;
    this._updateCacheFv = this._updateCache;
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this._height;
  }
  set height(v) {
    this._height = v;
    this._updateCacheFv = this._updateCache;
  }

  /**
   * Set all values with a rectangle
   * @param {Rectangle} rect - The rectangle
   */
  setRect(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  update() {
    this._updateCacheFv();
    this.updated = this._cacheUpdated;
    this._cacheUpdated = false;
  }

  /**
   * Update calculated crop values
   * @ignore
   */
  _updateCache() {
    this._updateCacheFv = noop;
    this._cacheUpdated = true;

    this.cache[2] = this._width - this.cache[0];
    this.cache[3] = this._height - this.cache[1];
  }
}
