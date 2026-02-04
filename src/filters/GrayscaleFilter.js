import { BaseFilter } from "./BaseFilter";

/**
 * Grayscale filter
 * @extends {BaseFilter}
 */
export class GrayscaleFilter extends BaseFilter {
  get GLSL() {
    return "oCl=vec4(vec3(gs(oCl.rgb)),oCl.a);";
  }
}
