import { BaseSamplingFilter } from "./BaseSamplingFilter";

// prettier-ignore
const _GLSL = BaseSamplingFilter.$createGLSL(
  "float " +
    "omx=(oCl.r+oCl.g+oCl.b)/3.;",
  "if((clg.r+clg.g+clg.b)/3.>omx){" + 
    "cl+=clg*lng;" + 
    "cnt+=lng;" + 
  "}"
);

/**
 * Blur filter
 * @extends {BaseSamplingFilter}
 */
export class GlowFilter extends BaseSamplingFilter {
  get GLSL() {
    return _GLSL;
  }
}
