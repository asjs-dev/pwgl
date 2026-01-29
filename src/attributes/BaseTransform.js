import { noop } from "../../extensions/utils/noop";

/**
 * Base class for positioning elements
 * @property {boolean} updated
 * @property {number} cosRotationA
 * @property {number} cosRotationB
 * @property {number} sinRotationA
 * @property {number} sinRotationB
 */
export class BaseTransform {
  /**
   * Creates an instance of BaseTransform.
   * @constructor
   */
  constructor() {
    this._updateRotationFv = noop;
    this.cosRotationA = this.cosRotationB = 1;

    this.sinRotationA =
      this.sinRotationB =
      this._x =
      this._y =
      this._rotation =
      this._anchorX =
      this._anchorY =
      this._skewX =
      this._skewY =
        0;
  }

  /**
   * Set/Get position x
   * @type {number}
   */
  get x() {
    return this._x;
  }
  set x(v) {
    this._x = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get position y
   * @type {number}
   */
  get y() {
    return this._y;
  }
  set y(v) {
    this._y = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get rotation
   * @type {number}
   */
  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    this._rotation = v;
    this._updateRotationFv = this._updateRotation;
  }

  /**
   * Set/Get anchor x
   * @type {number}
   */
  get anchorX() {
    return this._anchorX;
  }
  set anchorX(v) {
    this._anchorX = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get anchor y
   * @type {number}
   */
  get anchorY() {
    return this._anchorY;
  }
  set anchorY(v) {
    this._anchorY = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get skew x
   * @type {number}
   */
  get skewX() {
    return this._skewX;
  }
  set skewX(v) {
    this._skewX = v;
    this._updateRotationFv = this._updateRotation;
  }

  /**
   * Set/Get skew y
   * @type {number}
   */
  get skewY() {
    return this._skewY;
  }
  set skewY(v) {
    this._skewY = v;
    this._updateRotationFv = this._updateRotation;
  }

  /**
   * Update values
   */
  update() {
    this._updateRotationFv();
    this.updated = this.$transformUpdated;
    this.$transformUpdated = false;
  }

  /**
   * Update calculated rotation values
   * @ignore
   */
  _updateRotation() {
    this._updateRotationFv = noop;
    this.$transformUpdated = true;

    if (!this._skewX && !this._skewY) {
      this.sinRotationA = this.sinRotationB = Math.sin(this._rotation);
      this.cosRotationA = this.cosRotationB = Math.cos(this._rotation);
    } else {
      const rotSkewX = this._rotation - this._skewX,
        rotSkewY = this._rotation + this._skewY;

      this.sinRotationA = Math.sin(rotSkewY);
      this.cosRotationA = Math.cos(rotSkewY);
      this.sinRotationB = Math.sin(rotSkewX);
      this.cosRotationB = Math.cos(rotSkewX);
    }
  }
}
