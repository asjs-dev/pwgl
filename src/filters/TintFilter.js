import { BaseFilter } from "./BaseFilter.js";

export class TintFilter extends BaseFilter {
  constructor(intensity, r, g, b) {
    super(3, 4, intensity);

    this.r = r;
    this.g = g;
    this.b = b;
  }
}
