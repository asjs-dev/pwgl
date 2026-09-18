import { Utils } from "../core/Utils";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = Utils.GLSL.CREATE_SAMPLING_FILTER(
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
