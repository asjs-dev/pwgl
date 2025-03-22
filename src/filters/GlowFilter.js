import { BaseSamplingFilter } from "./BaseSamplingFilter";

// prettier-ignore
const _GLSL = BaseSamplingFilter.$createGLSL(
  "float " +
    "lng," +
    "omx=gtGS(oCl);",
  "if(gtGS(clg)>omx){" + 
    "lng=1.-length(ps)/lngWH;" +
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
