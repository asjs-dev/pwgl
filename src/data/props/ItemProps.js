import { BasePositioningProps } from "./BasePositioningProps";

/**
 * Class for element properties
 * @extends {BasePositioningProps}
 */
export class ItemProps extends BasePositioningProps {
  /**
   * Creates an instance of ItemProps.
   * @constructor
   */
  constructor() {
    super();

    this._scaleUpdateId = this._currentScaleUpdateId = 0;

    this.scaledWidth =
      this.scaledHeight =
      this._scaleX =
      this._scaleY =
      this._width =
      this._height =
      this.alpha =
        1;
  }

  /**
   * Set/Get scale x
   * @type {number}
   */
  get scaleX() {
    return this._scaleX;
  }
  set scaleX(v) {
    if (this._scaleX !== v) {
      this._scaleX = v;
      ++this._scaleUpdateId;
    }
  }

  /**
   * Set/Get scale y
   * @type {number}
   */
  get scaleY() {
    return this._scaleY;
  }
  set scaleY(v) {
    if (this._scaleY !== v) {
      this._scaleY = v;
      ++this._scaleUpdateId;
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
      ++this._scaleUpdateId;
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
      ++this._scaleUpdateId;
    }
  }

  /**
   * Update calculated scale values
   */
  updateScale() {
    if (this._currentScaleUpdateId < this._scaleUpdateId) {
      this._currentScaleUpdateId = this._scaleUpdateId;
      ++this.updateId;

      this.scaledWidth = this._width * this._scaleX;
      this.scaledHeight = this._height * this._scaleY;
    }
  }
}
