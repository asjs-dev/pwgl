import { BaseFilter } from "./BaseFilter";

/**
 * Rainbow filter
 * @extends {BaseFilter}
 */
export class RainbowFilter extends BaseFilter {
  get GLSL() {
    return "oCl.rgb+=vec3(v0.xy*.15,(v0.x*v0.y)*.15)*v;";
  }
}
