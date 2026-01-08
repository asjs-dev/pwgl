import { BaseFilter } from "./BaseFilter";

/**
 * Rainbow filter
 * @extends {BaseFilter}
 */
export class RainbowFilter extends BaseFilter {
  get GLSL() {
    return "oCl.rgb+=vec3(vUv.xy*.15,(vUv.x*vUv.y)*.15)*v;";
  }
}
