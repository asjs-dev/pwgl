import { BaseFilter } from "./BaseFilter.js";

export class GammaFilter extends BaseFilter {
  constructor(intensity) {
    super(3, 9, intensity);
  }
}
