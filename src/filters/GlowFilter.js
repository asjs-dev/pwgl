import { BaseSamplingFilter } from "./BaseSamplingFilter";

// prettier-ignore
const _GLSL = BaseSamplingFilter.$createGLSL(
  "float " +
    "omx=max(oCl.r,max(oCl.g,oCl.b));" +
  "cl=vec4(0);",
  "if(max(clg.r,max(clg.g,clg.b))>omx){" + 
    "cl+=clg;" + 
    "cnt++;" + 
  "}",
  "cl=(oCl+cl)/cnt;"
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
