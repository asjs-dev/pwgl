import { BaseKernelFilter } from "./BaseKernelFilter";

/**
 * Saturate filter
 * @extends {BaseKernelFilter}
 */
export class SaturateFilter extends BaseFilter {
  get GLSL() {
    // prettier-ignore
    return "vec3 " +
        "sv=(1.-v)*vec3(.3,.59,.11);" +

      "mat3 " +
        "kr=mat3(" +
          "sv.r+v,sv.g,sv.b," +
          "sv.r,sv.g+v,sv.b," +
          "sv.r,sv.g,sv.b+v" +
        ");" +

      "oCl.rgb=vec3(" +
        "kr[0].r*oCl.r+kr[0].g*oCl.g+kr[0].b*oCl.b," +
        "kr[1].r*oCl.r+kr[1].g*oCl.g+kr[1].b*oCl.b," +
        "kr[2].r*oCl.r+kr[2].g*oCl.g+kr[2].b*oCl.b" +
      ");";
  }
}
