import { BaseFilter } from "./BaseFilter";

/**
 * Base Sampling filter
 * @extends {BaseFilter}
 */
export class BaseSamplingFilter extends BaseFilter {
  /**
   * Creates an instance of BaseSamplingFilter.
   * @constructor
   * @param {number} intensityX
   * @param {number} intensityY
   * @param {number} isRadial
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} size
   */
  constructor(
    type,
    intensityX,
    intensityY,
    isRadial = false,
    centerX = 0.5,
    centerY = 0.5,
    size = 1
  ) {
    super(4, type, intensityX);

    this.intensityY = intensityY;
    this.isRadial = isRadial;
    this.centerX = centerX;
    this.centerY = centerY;
    this.size = size;
  }

  /**
   * Set/Get is blur radial
   * @type {boolean}
   */
  get isRadial() {
    return this.v[2] === 1;
  }
  set isRadial(v) {
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
