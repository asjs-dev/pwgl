import { BaseFilter } from "./BaseFilter";

/**
 * Pixelate filter
 * @extends {BaseFilter}
 */
export class PixelateFilter extends BaseFilter {
  get GLSL() {
    return "oCl=texture(uTx,floor(v0.zw/vol)*vol);";
  }
}
