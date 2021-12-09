import { arraySet } from "../utils/helpers.js";
import "../namespace.js";
import "./BaseFilter.js";

AGL.EdgeDetectFilter = class extends AGL.BaseFilter {
  constructor(intensity) {
    super(1, 0, intensity);

    arraySet(this.kernels, [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1
    ], 0);
  }
}
