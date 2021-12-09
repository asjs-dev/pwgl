import "../namespace.js";
import "./BaseFilter.js";

AGL.GlowFilter = class extends AGL.BaseFilter {
  constructor(intensityX, intensityY, volume) {
    super(4, 2, intensityX);

    this.intensityY = intensityY;
    this.volume = volume;
  }

  get volume() { return this.v[3]; }
  set volume(v) { this.v[3] = v; }
}
