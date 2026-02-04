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

    "oCl=vec4(" +
      "texture(uB,v0.zw-am).r," +
      "oCl.g," +
      "texture(uB,v0.zw+am).b," +
      "1" +
    ");";
  }
}
