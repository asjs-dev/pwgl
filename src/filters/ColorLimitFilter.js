import { BaseFilter } from "./BaseFilter";

/**
 * Color limit filter
 * @extends {BaseFilter}
 */
export class ColorLimitFilter extends BaseFilter {
  get GLSL() {
    return "oCl.rgb=(round((oCl.rgb*255.)/v)/255.)*v;";
  }
}
