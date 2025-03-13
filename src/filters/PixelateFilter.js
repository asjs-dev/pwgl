import { BaseFilter } from "./BaseFilter";

const _GLSL = "oCl=texture(uTex,floor(vTUv/vol)*vol);";

/**
 * Pixelate filter
 * @extends {BaseFilter}
 */
export class PixelateFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
