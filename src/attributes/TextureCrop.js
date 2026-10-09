import { noop } from "../../common/utils/noop";
import "../math/RectangleType";

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
    this.cache = new Float32Array([0, 0, 1, 1]);
    this.$updateCacheFv = this.$updateCache;
    this.$width = this.$height = 1;
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
    this.$updateCacheFv = this.$updateCache;
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
    this.$updateCacheFv = this.$updateCache;
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this.$width;
  }
  set width(v) {
    this.$width = v;
    this.$updateCacheFv = this.$updateCache;
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this.$height;
  }
  set height(v) {
    this.$height = v;
    this.$updateCacheFv = this.$updateCache;
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
    this.$updateCacheFv();
    this.updated = this.$cacheUpdated;
    this.$cacheUpdated = false;
  }

  /**
   * Update calculated crop values
   * @ignore
   */
  $updateCache() {
    this.$updateCacheFv = noop;
    this.$cacheUpdated = true;

    const { cache } = this;
    cache[2] = this.$width - cache[0];
    cache[3] = this.$height - cache[1];
  }
}
