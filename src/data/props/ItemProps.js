import { BaseTransformProps } from "./BaseTransformProps";

/**
 * Class for element properties
 * @extends {BaseTransformProps}
 */
export class ItemProps extends BaseTransformProps {
  /**
   * Creates an instance of ItemProps.
   * @constructor
   */
  constructor() {
    super();

    this.$scaleUpdateId = 0;
    this._currentScaleUpdateId = -1;

    this.scaledWidth =
      this.scaledHeight =
      this._scaleX =
      this._scaleY =
      this.$width =
      this.$height =
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
      ++this.$scaleUpdateId;
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
      ++this.$scaleUpdateId;
    }
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this.$width;
  }
  set width(v) {
    if (this.$width !== v) {
      this.$width = v;
      ++this.$scaleUpdateId;
    }
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this.$height;
  }
  set height(v) {
    if (this.$height !== v) {
      this.$height = v;
      ++this.$scaleUpdateId;
    }
  }

  /**
   * Update calculated scale values
   */
  updateScale() {
    if (this._currentScaleUpdateId < this.$scaleUpdateId) {
      this._currentScaleUpdateId = this.$scaleUpdateId;
      ++this.updateId;

      this.scaledWidth = this.$width * this._scaleX;
      this.scaledHeight = this.$height * this._scaleY;
    }
  }
}
