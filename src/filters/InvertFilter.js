import { BaseFilter } from "./BaseFilter.js";

export class InvertFilter extends BaseFilter {
  constructor(intensity) {
    super(3, 3, intensity);
  }
}
