import { BaseTransformProps } from "./BaseTransformProps";

/**
 * Class for item transform properties
 * @extends {BaseTransformProps}
 * @method updateScale
 */
export class ItemTransformProps extends BaseTransformProps {
  /**
   * Creates an instance of ItemTransformProps.
   * @constructor
   */
  constructor() {
    super();

    this.updateScale = noop;
    this.scaledWidth =
      this.scaledHeight =
      this._scaleX =
      this._scaleY =
      this.$width =
      this.$height =
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
      this.updateScale = this._updateScale;
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
      this.updateScale = this._updateScale;
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
      this.updateScale = this._updateScale;
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
      this.updateScale = this._updateScale;
    }
  }

  /**
   * Update calculated scale values
   * @ignore
   */
  _updateScale() {
    this.updateScale = noop;
    ++this.updateId;

    this.scaledWidth = this.$width * this._scaleX;
    this.scaledHeight = this.$height * this._scaleY;
  }
}
