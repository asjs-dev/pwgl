import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "float " +
    "thA=oCl.a," +
    "thL=dot(oCl.rgb/max(thA,1e-4),vec3(.2126,.7152,.0722))," +
    "thS=uL[1].z*.5," +
    "thT=thS>0.?smoothstep(v-thS,v+thS,thL):step(v,thL);" +
  "oCl.rgb=mix(uL[0].xyz,vec3(uL[0].w,uL[1].xy),thT)*thA;";

/**
 * <pre>
 *  Threshold filter
 *    - Replaces pixels below the luminance threshold with the low color and the others with the high color
 *    - The intensity is the threshold (default 0.5)
 *    - Works on un-premultiplied colors, the alpha is left untouched
 * </pre>
 * @extends {BaseFilter}
 */
export class ThresholdFilter extends BaseFilter {
  /**
   * Creates an instance of ThresholdFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.intensity - Default value 0.5 <br>
   *                                   - Luminance threshold
   * @param {number} options.lowR - Default value 0
   * @param {number} options.lowG - Default value 0
   * @param {number} options.lowB - Default value 0
   * @param {number} options.highR - Default value 1
   * @param {number} options.highG - Default value 1
   * @param {number} options.highB - Default value 1
   * @param {number} options.smoothness - Default value 0 <br>
   *                                    - Width of the soft transition around the threshold
   */
  constructor(options = {}) {
    super({ ...options, intensity: options.intensity ?? 0.5 });

    this.lowR = options.lowR ?? 0;
    this.lowG = options.lowG ?? 0;
    this.lowB = options.lowB ?? 0;
    this.highR = options.highR ?? 1;
    this.highG = options.highG ?? 1;
    this.highB = options.highB ?? 1;
    this.smoothness = options.smoothness ?? 0;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get low color red
   * @type {number}
   */
  get lowR() {
    return this.customData[0];
  }
  set lowR(v) {
    this.customData[0] = v;
  }

  /**
   * Set/Get low color green
   * @type {number}
   */
  get lowG() {
    return this.customData[1];
  }
  set lowG(v) {
    this.customData[1] = v;
  }

  /**
   * Set/Get low color blue
   * @type {number}
   */
  get lowB() {
    return this.customData[2];
  }
  set lowB(v) {
    this.customData[2] = v;
  }

  /**
   * Set/Get high color red
   * @type {number}
   */
  get highR() {
    return this.customData[3];
  }
  set highR(v) {
    this.customData[3] = v;
  }

  /**
   * Set/Get high color green
   * @type {number}
   */
  get highG() {
    return this.customData[4];
  }
  set highG(v) {
    this.customData[4] = v;
  }

  /**
   * Set/Get high color blue
   * @type {number}
   */
  get highB() {
    return this.customData[5];
  }
  set highB(v) {
    this.customData[5] = v;
  }

  /**
   * Set/Get smoothness
   *  - 0 is a hard step
   * @type {number}
   */
  get smoothness() {
    return this.customData[6];
  }
  set smoothness(v) {
    this.customData[6] = v;
  }
}
