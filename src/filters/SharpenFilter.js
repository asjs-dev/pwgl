import { arraySet } from "../utils/helpers.js";
import { BaseFilter } from "./BaseFilter.js";

export class SharpenFilter extends BaseFilter {
  constructor(intensity) {
    super(1, 0, intensity);

    arraySet(this.kernels, [
      -1,  -1,  -1,
      -1,  16,  -1,
      -1,  -1,  -1
    ], 0);
  }
}
