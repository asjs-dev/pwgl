import "../../geom/RectangleType";

/**
 * Class for texture crop properties
 */
export class TextureCrop {
  /**
   * Creates an instance of TextureCrop.
   * @constructor
   */
  constructor() {
    this.updateCrop = this._updateCrop;
    this.cache = [0, 0, 1, 1];

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
    if (this.cache[0] !== v) {
      this.cache[0] = v;
      this.updateCrop = this._updateCrop;
    }
  }

  /**
   * Set/Get y
   * @type {number}
   */
  get y() {
    return this.cache[1];
  }
  set y(v) {
    if (this.cache[1] !== v) {
      this.cache[1] = v;
      this.updateCrop = this._updateCrop;
    }
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this._width;
  }
  set width(v) {
    if (this._width !== v) {
      this._width = v;
      this.updateCrop = this._updateCrop;
    }
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this._height;
  }
  set height(v) {
    if (this._height !== v) {
      this._height = v;
      this.updateCrop = this._updateCrop;
    }
  }

  /**
   * Set all values with a rectangle
   * @param {Rectangle} rect
   */
  setRect(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Update calculated crop values
   * @ignore
   */
  _updateCrop() {
    this.updateCrop = noop;

    this.cache[2] = this._width - this.cache[0];
    this.cache[3] = this._height - this.cache[1];
  }
}
