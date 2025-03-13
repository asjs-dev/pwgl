import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl=oClVl+vec4(vec3(.874,.514,.156)*gtGS(oCl),oCl.a)*v;";

/**
 * Sepia filter
 * @extends {BaseFilter}
 */
export class SepiaFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
