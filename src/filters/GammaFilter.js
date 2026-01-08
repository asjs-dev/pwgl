import { BaseFilter } from "./BaseFilter";

/**
 * Gamma filter
 * @extends {BaseFilter}
 */
export class GammaFilter extends BaseFilter {
  get GLSL() {
    return "oCl.rgb=pow(oCl.rgb,vec3(1./v));";
  }
}
