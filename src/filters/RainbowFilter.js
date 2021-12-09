import { BaseFilter } from "./BaseFilter.js";

export class RainbowFilter extends BaseFilter {
  constructor(intensity) {
    super(3, 7, intensity);
  }
}
