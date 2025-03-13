import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl=oClVl+vec4(vec3(gtGS(oCl)),oCl.a)*v;";

/**
 * Grayscale filter
 * @extends {BaseFilter}
 */
export class GrayscaleFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
