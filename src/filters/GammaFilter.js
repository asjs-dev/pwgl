import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl.rgb=pow(oCl.rgb,vec3(1./v));";

/**
 * Gamma filter
 * @extends {BaseFilter}
 */
export class GammaFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
