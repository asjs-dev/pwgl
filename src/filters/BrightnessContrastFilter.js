import "../namespace.js";
import "./BaseFilter.js";

AGL.BrightnessContrastFilter = class extends AGL.BaseFilter {
  constructor(brightness, contrast) {
    super(3, 8, brightness);

    this.contrast = contrast;
  }

  get brightness() { return this.v[0]; }
  set brightness(v) { this.v[0] = v; }

  get contrast() { return this.v[1]; }
  set contrast(v) { this.v[1] = v; }
}
