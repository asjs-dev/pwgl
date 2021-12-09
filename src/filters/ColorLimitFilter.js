import { BaseFilter } from "./BaseFilter.js";

export class ColorLimitFilter extends BaseFilter {
  constructor(intensity) {
    super(3, 5, intensity);
  }
}
