import { BaseFilter } from "./BaseFilter.js";

export class GlowFilter extends BaseFilter {
  constructor(intensityX, intensityY, volume) {
    super(4, 2, intensityX);

    this.intensityY = intensityY;
    this.volume = volume;
  }

  get volume() { return this.v[2]; }
  set volume(v) { this.v[2] = v; }
}
