import { BaseFilter } from "./BaseFilter";

/**
 * Posterize filter
 * @extends {BaseFilter}
 */
export class PosterizeFilter extends BaseFilter {
  get GLSL() {
    // prettier-ignore
    return "float " + 
      "l=dot(oCl.rgb,vec3(.299,.587,.114))," +
      "q=floor(l*v+.5)/v;" +
      "oCl.rgb*=q/max(l,1e-5);";
  }
}
