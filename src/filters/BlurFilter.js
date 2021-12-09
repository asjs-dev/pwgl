import { BaseFilter } from "./BaseFilter.js";

export class BlurFilter extends BaseFilter {
  constructor(intensityX, intensityY) {
    super(4, 1, intensityX);

    this.intensityY = intensityY;
  }
}
