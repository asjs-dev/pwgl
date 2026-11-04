import { Utils } from "../core/Utils";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = Utils.GLSL.CREATE_SAMPLING_FILTER(
  "oCl*=.2;"
);

/**
 * Blur filter
 * - One pass averages five samples around each pixel, rotated by a stable per-pixel angle.
 * - For a smoother blur, chain several BlurFilters on one FilterRenderer: each pass blurs the
 *   previous result and the rotation noise averages out across the passes.
 * @extends {BaseFilter}
 */
export class BlurFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
