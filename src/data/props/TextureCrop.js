import { BaseProps } from "./BaseProps";
import "../../geom/RectangleType";

/**
 * Class for texture crop properties
 * @extends {BaseProps}
 */
export class TextureCrop extends BaseProps {
  /**
   * Creates an instance of TextureCrop.
   * @constructor
   */
  constructor() {
    super();

    this._currentUpdateId = 0;

    this.items = [0, 0, 1, 1];

    this._width = this._height = 1;
  }

  /**
   * Set/Get x
   * @type {number}
   */
  get x() {
    return this.items[0];
  }
  set x(v) {
    if (this.items[0] !== v) {
      this.items[0] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get y
   * @type {number}
   */
  get y() {
    return this.items[1];
  }
  set y(v) {
    if (this.items[1] !== v) {
      this.items[1] = v;
      ++this.updateId;
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
      ++this.updateId;
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
      ++this.updateId;
    }
  }

  /**
   * Update calculated crop values
   */
  updateCrop() {
    if (this._currentUpdateId < this.updateId) {
      this._currentUpdateId = this.updateId;

      this.items[2] = this._width - this.items[0];
      this.items[3] = this._height - this.items[1];
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
}
