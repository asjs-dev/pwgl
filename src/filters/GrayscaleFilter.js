import { BaseFilter } from "./BaseFilter";

/**
 * Grayscale filter
 * @extends {BaseFilter}
 */
export class GrayscaleFilter extends BaseFilter {
  get GLSL() {
    return "oCl=oClVl+vec4(vec3(gtGS(oCl.rgb)),oCl.a)*v;";
  }
}
