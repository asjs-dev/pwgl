import { BaseKernelFilter } from "./BaseKernelFilter";

/**
 * Saturate filter
 * @extends {BaseKernelFilter}
 */
export class SaturateFilter extends BaseKernelFilter {
  get GLSL() {
    // prettier-ignore
    return "" +
      "oCl.rgb=(oCl.rgb*(1.-vl[1]))+vec3(" +
        "kr[0].r*oCl.r+kr[0].g*oCl.g+kr[0].b*oCl.b," +
        "kr[1].r*oCl.r+kr[1].g*oCl.g+kr[1].b*oCl.b," +
        "kr[2].r*oCl.r+kr[2].g*oCl.g+kr[2].b*oCl.b" +
      ");";
  }

  /**
   * Set intensity
   * @type {number}
   */
  get intensity() {
    return this.v[0];
  }
  set intensity(v) {
    this.v[0] = v;
    const sv = 1 - v,
      svr = sv * 0.3,
      svg = sv * 0.59,
      svb = sv * 0.11;

    // prettier-ignore
    this.kernels = [
      svr + v, svg, svb, 0,
      svr, svg + v, svb, 0,
      svr, svg, svb + v, 0
    ];
  }
}
