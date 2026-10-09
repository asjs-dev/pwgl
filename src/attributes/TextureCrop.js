import "../math/RectangleType";

/**
 * Class for texture crop properties
 * @property {Array<number>} cache
 */
export class TextureCrop {
  /**
   * Creates an instance of TextureCrop.
   * @constructor
   */
  constructor() {
    this.cache = new Float32Array([0, 0, 1, 1]);
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
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this.cache[2];
  }
  set width(v) {
    this.cache[2] = v;
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this.cache[3];
  }
  set height(v) {
    this.cache[3] = v;
  }

  /**
   * Set all values with a rectangle, the rectangle's (x, y) and (width, height) values are coordinates in the texture space (0-1)
   * @param {Rectangle} rect - The rectangle
   */
  setRect(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }
}
