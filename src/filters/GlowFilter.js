import { BaseFilter } from "./BaseFilter";
import { Utils } from "../core/Utils";

// prettier-ignore
const _GLSL = Utils.GLSL.CREATE_SAMPLING_FILTER(
  // Average the five samples, as BlurFilter does, so luminance stays in the source range.
  "oCl*=.2;" +

  "float " +
    "t=uL[0].x," +
    "k=uL[0].y," +
    "l=dot(oCl.rgb,vec3(.2126,.7152,.0722))," +
    "s=clamp((l-t+k)/(2.*k),0.,1.)," +
    "b=max(l-t,0.)+s*s*k;" +
  
  "oCl.rgb=tmpCl.rgb+oCl.rgb*b*uL[0].z;" +
  "oCl.a=tmpCl.a;"
);

/**
 * Glow filter
 * - Adds a blurred bloom of the pixels brighter than the threshold to the original image.
 * @extends {BaseFilter}
 */
export class GlowFilter extends BaseFilter {
  constructor(options = {}) {
    super(options);

    this.threshold = options.threshold ?? 0.7;
    this.knee = options.knee ?? 1;
    this.bloom = options.bloom ?? 0.4;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Bloom brightness threshold.
   * - Pixels with luminance above this value contribute to the bloom effect.
   * @type {number}
   */
  get threshold() {
    return this.customData[0];
  }
  set threshold(v) {
    this.customData[0] = v;
  }

  /**
   * Bloom soft knee width.
   * - Controls how smoothly the bloom fades in around the threshold.
   * @type {number}
   */
  get knee() {
    return this.customData[1];
  }
  set knee(v) {
    this.customData[1] = v;
  }

  /**
   * Bloom intensity.
   * - Scales the strength of the bloom added to the original image.
   * - Default 0.4, useful range 0 - 5.
   * @type {number}
   */
  get bloom() {
    return this.customData[2];
  }
  set bloom(v) {
    this.customData[2] = v;
  }
}
