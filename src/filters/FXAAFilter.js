import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "ivec2 " +
    "faM=ivec2(ts)-1;" +
  "vec3 " +
    "faL=vec3(.299,.587,.114);" +
  "vec4 " +
    "faNW=texelFetch(uB,clamp(f-1,ivec2(0),faM),0)," +
    "faNE=texelFetch(uB,clamp(f+ivec2(1,-1),ivec2(0),faM),0)," +
    "faSW=texelFetch(uB,clamp(f+ivec2(-1,1),ivec2(0),faM),0)," +
    "faSE=texelFetch(uB,clamp(f+1,ivec2(0),faM),0);" +
  "float " +
    "lNW=dot(faNW.rgb/max(faNW.a,1e-4),faL)," +
    "lNE=dot(faNE.rgb/max(faNE.a,1e-4),faL)," +
    "lSW=dot(faSW.rgb/max(faSW.a,1e-4),faL)," +
    "lSE=dot(faSE.rgb/max(faSE.a,1e-4),faL)," +
    "lM=dot(oCl.rgb/max(oCl.a,1e-4),faL)," +
    "lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE)))," +
    "lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));" +
  "vec2 " +
    "faD=vec2(lSW+lSE-lNW-lNE,lNW+lSW-lNE-lSE);" +
  "float " +
    "faR=max((lNW+lNE+lSW+lSE)*.25*uL[0].y,uL[0].z);" +
  "faD=clamp(faD/(min(abs(faD.x),abs(faD.y))+faR),-uL[0].x,uL[0].x)/ts;" +
  "vec4 " +
    "faA=.5*(texture(uB,v0.zw-faD/6.)+texture(uB,v0.zw+faD/6.))," +
    "faB=faA*.5+.25*(texture(uB,v0.zw-faD*.5)+texture(uB,v0.zw+faD*.5));" +
  "float " +
    "lB=dot(faB.rgb/max(faB.a,1e-4),faL);" +
  "oCl=lB<lMin||lB>lMax?faA:faB;";

/**
 * <pre>
 *  FXAA filter
 *    - Lightweight fast approximate anti-aliasing (5 luma taps and one directional span)
 *    - The intensity is unused, use mix to control the strength
 * </pre>
 * @extends {BaseFilter}
 */
export class FXAAFilter extends BaseFilter {
  /**
   * Creates an instance of FXAAFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.spanMax - Default value 8 <br>
   *                                 - Maximum blur span in pixels
   * @param {number} options.reduceMul - Default value 1/8 <br>
   *                                   - Direction reduce multiplier
   * @param {number} options.reduceMin - Default value 1/128 <br>
   *                                   - Minimum direction reduce
   */
  constructor(options = {}) {
    super(options);

    this.spanMax = options.spanMax ?? 8;
    this.reduceMul = options.reduceMul ?? 1 / 8;
    this.reduceMin = options.reduceMin ?? 1 / 128;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get maximum span in pixels
   * @type {number}
   */
  get spanMax() {
    return this.customData[0];
  }
  set spanMax(v) {
    this.customData[0] = v;
  }

  /**
   * Set/Get reduce multiplier
   * @type {number}
   */
  get reduceMul() {
    return this.customData[1];
  }
  set reduceMul(v) {
    this.customData[1] = v;
  }

  /**
   * Set/Get minimum reduce
   * @type {number}
   */
  get reduceMin() {
    return this.customData[2];
  }
  set reduceMin(v) {
    this.customData[2] = v;
  }
}
