import { arraySet } from "../utils/helpers";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "" +
  "kr*=v;" +
  "oCl.rgb=(oCl.rgb*(1.-vl[1]))+(" +
    "texelFetch(uTex,f-ivec2(1),0)*kr[0].x+" +
    "texelFetch(uTex,f+ivec2(0,-1),0)*kr[0].y+" +
    "texelFetch(uTex,f+ivec2(1,-1),0)*kr[0].z+" +
    "texelFetch(uTex,f+ivec2(-1,0),0)*kr[0].w+" +
    "oCl*kr[1].x+" +
    "texelFetch(uTex,f+ivec2(1,0),0)*kr[1].y+" +
    "texelFetch(uTex,f+ivec2(-1,1),0)*kr[1].z+" +
    "texelFetch(uTex,f+ivec2(0,1),0)*kr[1].w+" +
    "texelFetch(uTex,f+ivec2(1),0)*kr[2].x" +
  ").rgb*vl[1];";

/**
 * Base kernel filter
 * @extends {BaseFilter}
 */
export class BaseKernelFilter extends BaseFilter {
  /**
   * Creates an instance of BaseKernelFilter.
   * @constructor
   * @param {number} intensity
   * @param {number} mix
   */
  constructor(intensity, mix = 1) {
    super(intensity);

    this.mix = mix;
  }

  get GLSL() {
    return _GLSL;
  }

  get kernels() {
    return this._kernels;
  }

  set kernels(v) {
    this._kernels = arraySet(this._kernels ?? new Float32Array(16), v);
  }
}
