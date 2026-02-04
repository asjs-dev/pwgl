import { BaseFilter } from "./BaseFilter";

/**
 * Contrast filter
 * @extends {BaseFilter}
 */
export class ContrastFilter extends BaseFilter {
  get GLSL() {
    return "oCl.rgb=(oCl.rgb-.5)*v+.5;";
  }
}
