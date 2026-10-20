import { ToneMapType } from "../rendering/ToneMapType";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "float " +
    "tmA=oCl.a;" +
  "vec3 " +
    "tmC=oCl.rgb/max(tmA,1e-4)*v;" +
  "tmC=int(uL[0].x+.5)==1" +
    "?clamp((tmC*(2.51*tmC+.03))/(tmC*(2.43*tmC+.59)+.14),0.,1.)" +
    ":tmC/(1.+tmC);" +
  "oCl.rgb=tmC*tmA;";

/**
 * <pre>
 *  Tone map filter
 *    - Maps HDR-like colors into the 0-1 range
 *    - The intensity is the exposure (default 1)
 *    - Works on un-premultiplied colors, the alpha is left untouched
 * </pre>
 * @extends {BaseFilter}
 */
export class ToneMapFilter extends BaseFilter {
  /**
   * Creates an instance of ToneMapFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.type - Default value ToneMapType.ACES <br>
   *                              - Tone map operator
   */
  constructor(options = {}) {
    super(options);

    this.type = options.type ?? ToneMapType.ACES;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get tone map type
   * @type {number}
   */
  get type() {
    return this.customData[0];
  }
  set type(v) {
    this.customData[0] = v;
  }
}
