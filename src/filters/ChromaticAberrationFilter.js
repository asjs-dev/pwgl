import { BaseFilter } from "./BaseFilter";

/**
 * Chromatic aberration filter
 * @extends {BaseFilter}
 */
export class ChromaticAberrationFilter extends BaseFilter {
  get GLSL() {
    // prettier-ignore
    return "vec2 " +
      "am=vec2(vol.x,0);" +

    "vec4 " +
      "cl=texture(uB,v0.zw-am)," +
      "cr=texture(uB,v0.zw+am);" +

    // Keep the source alpha: the widest of the three sampled alphas.
    "oCl=vec4(" +
      "cl.r," +
      "oCl.g," +
      "cr.b," +
      "max(oCl.a,max(cl.a,cr.a))" +
    ");";
  }
}
