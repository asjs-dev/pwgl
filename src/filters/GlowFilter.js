import { BaseSamplingFilter } from "./BaseSamplingFilter";

// prettier-ignore
const _GLSL = BaseSamplingFilter.$createGLSL(
  "float " +
    "clgRl," +
    "bst=1.," +
    "oClRl=rl(oCl.rgb);",
  "clgRl=rl(clg.rgb);" +
  "bst+=max(0.,(clgRl-oClRl)/ln);",
  "cl*=bst+(bst>1.?lngWH:0.);"
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
