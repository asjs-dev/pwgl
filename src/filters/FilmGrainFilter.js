import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "float " +
    "fgT=uL[0].y>0.?mod(floor(mod(uF.z,1e4)*.001*uL[0].y),64.):0.," +
    "fgG=rand(floor(v0.zw*ts/max(uL[0].z,1.))+vec2(fgT*17.31,uL[0].x*23.17))-.5;" +
  "oCl.rgb=clamp(oCl.rgb+fgG*v*oCl.a,0.,oCl.a);";

/**
 * <pre>
 *  Film grain filter
 *    - Adds animated noise to the image
 *    - The intensity is the grain amount (default 0.1)
 * </pre>
 * @extends {BaseFilter}
 */
export class FilmGrainFilter extends BaseFilter {
  /**
   * Creates an instance of FilmGrainFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.intensity - Default value 0.1 <br>
   *                                   - Grain amount
   * @param {number} options.seed - Default value 1 <br>
   *                              - Noise seed
   * @param {number} options.fps - Default value 24 <br>
   *                             - Grain updates per second, 0 is a static grain independent of the render time
   * @param {number} options.grainSize - Default value 1 <br>
   *                                   - Grain cell size in pixels
   */
  constructor(options = {}) {
    super({ ...options, intensity: options.intensity ?? 0.1 });

    this.seed = options.seed ?? 1;
    this.fps = options.fps ?? 24;
    this.grainSize = options.grainSize ?? 1;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get noise seed
   * @type {number}
   */
  get seed() {
    return this.customData[0];
  }
  set seed(v) {
    this.customData[0] = v;
  }

  /**
   * Set/Get grain updates per second
   *  - 0 is a static grain
   * @type {number}
   */
  get fps() {
    return this.customData[1];
  }
  set fps(v) {
    this.customData[1] = v;
  }

  /**
   * Set/Get grain cell size in pixels
   * @type {number}
   */
  get grainSize() {
    return this.customData[2];
  }
  set grainSize(v) {
    this.customData[2] = v;
  }
}
