import { noop } from "../../common/utils/noop";

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
    this.$updateRotationFv = noop;
    this.cosRotationA = this.cosRotationB = 1;

    this.sinRotationA =
      this.sinRotationB =
      this.$x =
      this.$y =
      this.$rotation =
      this.$anchorX =
      this.$anchorY =
      this.$skewX =
      this.$skewY =
        0;
  }

  /**
   * Set/Get position x
   * @type {number}
   */
  get x() {
    return this.$x;
  }
  set x(v) {
    this.$x = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get position y
   * @type {number}
   */
  get y() {
    return this.$y;
  }
  set y(v) {
    this.$y = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get rotation
   * @type {number}
   */
  get rotation() {
    return this.$rotation;
  }
  set rotation(v) {
    this.$rotation = v;
    this.$updateRotationFv = this.$updateRotation;
  }

  /**
   * Set/Get anchor x
   * @type {number}
   */
  get anchorX() {
    return this.$anchorX;
  }
  set anchorX(v) {
    this.$anchorX = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get anchor y
   * @type {number}
   */
  get anchorY() {
    return this.$anchorY;
  }
  set anchorY(v) {
    this.$anchorY = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get skew x
   * @type {number}
   */
  get skewX() {
    return this.$skewX;
  }
  set skewX(v) {
    this.$skewX = v;
    this.$updateRotationFv = this.$updateRotation;
  }

  /**
   * Set/Get skew y
   * @type {number}
   */
  get skewY() {
    return this.$skewY;
  }
  set skewY(v) {
    this.$skewY = v;
    this.$updateRotationFv = this.$updateRotation;
  }

  /**
   * Update values
   */
  update() {
    this.$updateRotationFv();
    this.updated = this.$transformUpdated;
    this.$transformUpdated = false;
  }

  /**
   * Update calculated rotation values
   * @ignore
   */
  $updateRotation() {
    this.$updateRotationFv = noop;
    this.$transformUpdated = true;

    if (!this.$skewX && !this.$skewY) {
      this.sinRotationA = this.sinRotationB = Math.sin(this.$rotation);
      this.cosRotationA = this.cosRotationB = Math.cos(this.$rotation);
    } else {
      const rotSkewX = this.$rotation - this.$skewX;
      const rotSkewY = this.$rotation + this.$skewY;

      this.sinRotationA = Math.sin(rotSkewY);
      this.cosRotationA = Math.cos(rotSkewY);
      this.sinRotationB = Math.sin(rotSkewX);
      this.cosRotationB = Math.cos(rotSkewX);
    }
  }
}
