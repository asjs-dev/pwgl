import { arraySet } from "../utils/helpers.js";
import "../namespace.js";
import "./BaseFilter.js";

AGL.SharpenFilter = class extends AGL.BaseFilter {
  constructor(intensity) {
    super(1, 0, intensity);

    arraySet(this.kernels, [
      -1,  -1,  -1,
      -1,  16,  -1,
      -1,  -1,  -1
    ], 0);
  }
}
