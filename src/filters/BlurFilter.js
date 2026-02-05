import { CREATE_SAMPLING_FILTER } from "../utils/shaderUtils";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = CREATE_SAMPLING_FILTER(
  "oCl*=.2;"
);

/**
 * Blur filter
 * @extends {BaseFilter}
 */
export class BlurFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
