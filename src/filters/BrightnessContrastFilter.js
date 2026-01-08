import { BaseFilter } from "./BaseFilter";

/**
 * Brightness and contrast filter
 * @extends {BaseFilter}
 */
export class BrightnessContrastFilter extends BaseFilter {
  /**
   * Creates an instance of BrightnessContrastFilter.
   * @constructor
   * @param {number} brightness
   * @param {number} contrast
   */
  constructor(brightness, contrast) {
    super(brightness);
    
    this.contrast = contrast;
  }

  get GLSL() {
    return "oCl.rgb=(vl[1]+1.)*oCl.rgb*v-.5*vl[1];";
  }

  /**
   * Set/Get brightness
   * @type {number}
   */
  get brightness() {
    return this.v[0];
  }
  set brightness(v) {
    this.v[0] = v;
  }

  /**
   * Set/Get contrast
   * @type {number}
   */
  get contrast() {
    return this.v[1] * 100;
  }
  set contrast(v) {
    this.v[1] = v / 100;
  }
}
