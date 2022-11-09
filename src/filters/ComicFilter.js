import { BaseFilter } from "./BaseFilter.js";

export class ComicFilter extends BaseFilter {
  constructor(intensityX, intensityY) {
    super(4, 3, intensityX);

    this.intensityY = intensityY;
  }
}
