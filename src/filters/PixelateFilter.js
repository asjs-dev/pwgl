import { BaseFilter } from "./BaseFilter.js";

export class PixelateFilter extends BaseFilter {
  constructor(intensity) {
    super(5, 0, intensity);
  }
}
