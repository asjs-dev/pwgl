import { BaseFilter } from "./BaseFilter.js";

export class SepiaFilter extends BaseFilter {
  constructor(intensity) {
    super(3, 2, intensity);
  }
}
