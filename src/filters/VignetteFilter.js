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
    super(intensity);

    this.roundness = roundness;
    this.transition = transition;
    this.r = r;
    this.g = g;
    this.b = b;
  }

  get GLSL() {
    // prettier-ignore
    return "" +
      "vec2 pv=pow(abs(vUv*v),vec2(vl[1]));" +
      "float cv=clamp((1.-length(pv))*vl[5],0.,1.);" +
      "oCl.rgb=oCl.rgb*cv+rgb*(1.-cv);";
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
