import { BaseFilter } from "./BaseFilter";

/**
 * Blur filter
 * @extends {BaseFilter}
 */
export class BlurFilter extends BaseFilter {
  /**
   * Creates an instance of BlurFilter.
   * @constructor
   * @param {number} intensityX
   * @param {number} intensityY
   * @param {number} isRadialBlur
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} size
   */
  constructor(intensityX, intensityY, isRadialBlur, centerX, centerY, size) {
    super(4, 1, intensityX);

    this.intensityY = intensityY;
    this.isRadialBlur = isRadialBlur || false;
    this.centerX = centerX || 0;
    this.centerY = centerY || 0;
    this.size = size || 1;
  }

  /**
   * Set/Get is blur radial
   * @type {boolean}
   */
  get isRadialBlur() {
    return this.v[2] === 1;
  }
  set isRadialBlur(v) {
    this.v[2] = v ? 1 : 0;
  }

  /**
   * Set/Get center x
   * @type {number}
   */
  get centerX() {
    return this.v[3];
  }
  set centerX(v) {
    this.v[3] = v;
  }

  /**
   * Set/Get center y
   * @type {number}
   */
  get centerY() {
    return this.v[4];
  }
  set centerY(v) {
    this.v[4] = v;
  }

  /**
   * Set/Get size
   * @type {number}
   */
  get size() {
    return this.v[5];
  }
  set size(v) {
    this.v[5] = v;
  }
}
