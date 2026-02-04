import { BaseFilter } from "./BaseFilter";

/**
 * Base kernel filter
 * @extends {BaseFilter}
 */
export class BaseKernelFilter extends BaseFilter {
  get GLSL() {
    // prettier-ignore
    return "mat3 " + 
        "kr=uK*v;" +
      "oCl.rgb=(" +
        "texelFetch(uB,f-ivec2(1),0)*kr[0].x+" +
        "texelFetch(uB,f+ivec2(0,-1),0)*kr[0].y+" +
        "texelFetch(uB,f+ivec2(1,-1),0)*kr[0].z+" +
        "texelFetch(uB,f+ivec2(-1,0),0)*kr[1].x+" +
        "oCl*kr[1].y+" +
        "texelFetch(uB,f+ivec2(1,0),0)*kr[1].z+" +
        "texelFetch(uB,f+ivec2(-1,1),0)*kr[2].x+" +
        "texelFetch(uB,f+ivec2(0,1),0)*kr[2].y+" +
        "texelFetch(uB,f+ivec2(1),0)*kr[2].z" +
      ").rgb;";
  }
}
