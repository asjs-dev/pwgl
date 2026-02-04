import { BaseFilter } from "./BaseFilter";

/**
 * Sepia filter
 * @extends {BaseFilter}
 */
export class SepiaFilter extends BaseFilter {
  get GLSL() {
    return "oCl=vec4(vec3(.874,.514,.156)*gs(oCl.rgb),oCl.a);";
  }
}
