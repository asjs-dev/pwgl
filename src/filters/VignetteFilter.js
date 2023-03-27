import { BaseFilter } from "./BaseFilter";

/**
 * Vignette filter
 * @extends {BaseFilter}
 */
export class VignetteFilter extends BaseFilter {
  /**
   * Creates an instance of VignetteFilter.
   * @constructor
   * @param {number} intensity
   * @param {number} roundness
   * @param {number} transition
   * @param {number} r
   * @param {number} g
   * @param {number} b
   */
  constructor(intensity, roundness, transition, r, g, b) {
    super(3, 6, intensity);

    this.roundness = roundness;
    this.transition = transition;
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * Set/Get roundnes
   * @type {number}
   */
  get roundness() {
    return this.v[1];
  }
  set roundness(v) {
    this.v[1] = v;
  }

  /**
   * Set/Get transition
   * @type {number}
   */
  get transition() {
    return 1 / this.v[5];
  }
  set transition(v) {
    this.v[5] = 1 / v;
  }
}
