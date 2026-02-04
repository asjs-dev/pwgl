import { CREATE_SAMPLING_FILTER } from "../utils/shaderUtils";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = CREATE_SAMPLING_FILTER(
  "float " +
    "l=dot(oCl.rgb,vec3(.2126,.7152,.0722))," +
    "k=uL[0].x*.5," +
    "t=max(l-uL[0].x+k,.0);" +
  
  "oCl.rgb*=t*t/(k+1e-5);",
  "oCl=tmpCl+oCl*.2;"
);

/**
 * Blur filter
 * @extends {BaseFilter}
 */
export class GlowFilter extends BaseFilter {
  constructor(options) {
    super(options);

    this.threshold = options.threshold ?? 0.7;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Threshold of bloom filter
   * @type {number}
   */
  get threshold() {
    return this.customData[0];
  }
  set threshold(v) {
    this.customData[0] = v;
  }
}
