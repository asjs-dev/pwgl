import { BaseFilter } from "./BaseFilter";

/**
 * Brightness filter
 * @extends {BaseFilter}
 */
export class BrightnessFilter extends BaseFilter {
  get GLSL() {
    return "oCl.rgb*=v;";
  }
}
