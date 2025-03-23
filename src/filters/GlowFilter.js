import { BaseSamplingFilter } from "./BaseSamplingFilter";

// prettier-ignore
const _GLSL = BaseSamplingFilter.$createGLSL(
  "float " +
    "lng," +
    "omx=gtGS(oCl);",
  "if(gtGS(clg)>omx){" + 
    "lng=lngWH/length(ps);" +
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
