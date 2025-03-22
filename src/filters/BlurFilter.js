import { BaseSamplingFilter } from "./BaseSamplingFilter";

// prettier-ignore
const _GLSL = BaseSamplingFilter.$createGLSL(
  "",
  "cl+=clg;" + 
  "cnt++;"
);

/**
 * Blur filter
 * @extends {BaseSamplingFilter}
 */
export class BlurFilter extends BaseSamplingFilter {
  get GLSL() {
    return _GLSL;
  }
}
