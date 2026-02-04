import { BaseFilter } from "./BaseFilter";

/**
 * Invert filter
 * @extends {BaseFilter}
 */
export class InvertFilter extends BaseFilter {
  get GLSL() {
    return "oCl=vec4(1.-oCl.rgb,oCl.a);";
  }
}
