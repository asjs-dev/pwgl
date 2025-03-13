import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl.rgb=(round((oCl.rgb*255.)/v)/255.)*v;";

/**
 * Color limit filter
 * @extends {BaseFilter}
 */
export class ColorLimitFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
