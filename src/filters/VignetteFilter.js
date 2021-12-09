import "../namespace.js";
import "./BaseFilter.js";

AGL.VignetteFilter = class extends AGL.BaseFilter {
  constructor(intensity, roundness, transition, r, g, b) {
    super(3, 6, intensity);

    this.roundness = roundness;
    this.transition = transition;
    this.r = r;
    this.g = g;
    this.b = b;
  }

  get roundness() { return this.v[1]; }
  set roundness(v) { this.v[1] = v; }

  get transition() { return 1 / this.v[5]; }
  set transition(v) { this.v[5] = 1 / v; }
}
