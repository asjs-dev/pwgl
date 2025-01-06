import { noop } from "../../utils/helpers";
import { BaseTransformProps } from "./BaseTransformProps";

/**
 * Class for item transform properties
 * @extends {BaseTransformProps}
 * @property {function} updateScale
 * @property {number} scaledWidth
 * @property {number} scaledHeight
 */
export class ItemTransformProps extends BaseTransformProps {
  /**
   * Creates an instance of ItemTransformProps.
   * @constructor
   */
  constructor() {
    super();

    this.$updateScaleFv = noop;
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
    this._scaleX = v;
    this.$updateScaleFv = this.$updateScale;
  }

  /**
   * Set/Get scale y
   * @type {number}
   */
  get scaleY() {
    return this._scaleY;
  }
  set scaleY(v) {
    this._scaleY = v;
    this.$updateScaleFv = this.$updateScale;
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
    this.$updateScaleFv = this.$updateScale;
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
    this.$updateScaleFv = this.$updateScale;
  }

  update() {
    this.$updateScaleFv();
    super.update();
  }

  /**
   * Update calculated scale values
   * @ignore
   */
  $updateScale() {
    this.$updateScaleFv = noop;
    this.$transformUpdated = true;

    this.scaledWidth = this.$width * this._scaleX;
    this.scaledHeight = this.$height * this._scaleY;
  }
}
