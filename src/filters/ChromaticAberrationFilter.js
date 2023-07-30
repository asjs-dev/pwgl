import { BaseFilter } from "./BaseFilter";

/**
 * Chromatic aberration filter
 * @extends {BaseFilter}
 */
export class ChromaticAberrationFilter extends BaseFilter {
  /**
   * Creates an instance of ChromaticAberrationFilter.
   * @constructor
   * @param {number} intensity
   * @param {number} isRadial
   * @param {number} centerX
   * @param {number} centerY
   * @param {boolean} invertRadial
   */
  constructor(
    intensity,
    isRadial = false,
    centerX = 0.5,
    centerY = 0.5,
    invertRadial = false
  ) {
    super(8, 0, intensity);

    this.isRadial = isRadial;
    this.centerX = centerX;
    this.centerY = centerY;
    this.invertRadial = invertRadial;
  }

  /**
   * Set/Get is radial
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
   * Set/Get invertRadial
   * @type {boolean}
   */
  get invertRadial() {
    return this.v[5];
  }
  set invertRadial(v) {
    this.v[5] = v;
  }
}
