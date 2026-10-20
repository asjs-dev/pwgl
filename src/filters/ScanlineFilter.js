import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "vec2 " +
    "slC=v0.zw-.5," +
    "slU=v0.zw;" +
  "if(uL[0].y>0.){" +
    "slU=.5+slC*(1.+uL[0].y*dot(slC,slC));" +
    "oCl=any(lessThan(slU,Z.xx))||any(greaterThan(slU,Z.yy))?vec4(0):texture(uB,slU);" +
  "}" +
  "oCl.rgb*=" +
    "(1.-v*step(.5,fract(slU.y*ts.y/max(uL[0].x,1.))))*" +
    "clamp(1.-uL[0].z*dot(slC,slC)*2.,0.,1.);";

/**
 * <pre>
 *  Scanline filter
 *    - Darkens every other band of rows, with optional CRT curvature and vignette
 *    - The intensity is the line strength (default 0.3)
 *    - With curvature, pixels outside the warped image are transparent
 *    - The radial fade and mix blend against the unwarped source image
 * </pre>
 * @extends {BaseFilter}
 */
export class ScanlineFilter extends BaseFilter {
  /**
   * Creates an instance of ScanlineFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.intensity - Default value 0.3 <br>
   *                                   - Line strength
   * @param {number} options.spacing - Default value 2 <br>
   *                                 - Line period in pixels
   * @param {number} options.curvature - Default value 0 <br>
   *                                   - CRT barrel curvature, 0 is off
   * @param {number} options.vignette - Default value 0 <br>
   *                                  - Corner darkening, 0 is off
   */
  constructor(options = {}) {
    super({ ...options, intensity: options.intensity ?? 0.3 });

    this.spacing = options.spacing ?? 2;
    this.curvature = options.curvature ?? 0;
    this.vignette = options.vignette ?? 0;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get line period in pixels
   * @type {number}
   */
  get spacing() {
    return this.customData[0];
  }
  set spacing(v) {
    this.customData[0] = v;
  }

  /**
   * Set/Get CRT curvature
   *  - 0 is off
   * @type {number}
   */
  get curvature() {
    return this.customData[1];
  }
  set curvature(v) {
    this.customData[1] = v;
  }

  /**
   * Set/Get vignette
   *  - 0 is off
   * @type {number}
   */
  get vignette() {
    return this.customData[2];
  }
  set vignette(v) {
    this.customData[2] = v;
  }
}
