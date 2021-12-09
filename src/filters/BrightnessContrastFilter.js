import { BaseFilter } from "./BaseFilter.js";

export class BrightnessContrastFilter extends BaseFilter {
  constructor(brightness, contrast) {
    super(3, 8, brightness);

    this.contrast = contrast;
  }

  get brightness() { return this.v[0]; }
  set brightness(v) { this.v[0] = v; }

  get contrast() { return this.v[1]; }
  set contrast(v) { this.v[1] = v; }
}
