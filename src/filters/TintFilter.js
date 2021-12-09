import "../namespace.js";
import "./BaseFilter.js";

AGL.TintFilter = class extends AGL.BaseFilter {
  constructor(intensity, r, g, b) {
    super(3, 4, intensity);

    this.r = r;
    this.g = g;
    this.b = b;
  }
}
