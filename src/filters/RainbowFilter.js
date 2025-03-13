import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl.rgb+=vec3(vUv.xy*.15,(vUv.x*vUv.y)*.15)*v;";

/**
 * Rainbow filter
 * @extends {BaseFilter}
 */
export class RainbowFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
