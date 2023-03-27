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
    super(3, 8, brightness);

    this.contrast = contrast;
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
    return this.v[1];
  }
  set contrast(v) {
    this.v[1] = v;
  }
}
