import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl=oClVl+vec4(1.-oCl.rgb,oCl.a)*v;";

/**
 * Invert filter
 * @extends {BaseFilter}
 */
export class InvertFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
