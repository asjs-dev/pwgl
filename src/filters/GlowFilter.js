import { BaseFilter } from "./BaseFilter.js";

export class GlowFilter extends BaseFilter {
  constructor(intensityX, intensityY) {
    super(4, 2, intensityX);

    this.intensityY = intensityY;
  }
}
