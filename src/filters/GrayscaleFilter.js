import { BaseFilter } from "./BaseFilter.js";

export class GrayscaleFilter extends BaseFilter {
  constructor(intensity) {
    super(3, 1, intensity);
  }
}
