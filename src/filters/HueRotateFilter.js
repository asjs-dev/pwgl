import { BaseFilter } from "./BaseFilter";

/**
 * Hue rotate filter
 * @extends {BaseFilter}
 */
export class HueRotateFilter extends BaseFilter {
  get GLSL() {
    // prettier-ignore
    return "float " +
      "ca=cos(v)," +
      "sa=sin(v);" +
    
    "oCl.rgb*=mat3(" +
        ".299+.701*ca+.168*sa," +
        ".587-.587*ca+.330*sa," +
        ".114-.114*ca-.497*sa," +

        ".299-.299*ca-.328*sa," +
        ".587+.413*ca+.035*sa," +
        ".114-.114*ca+.292*sa," +

        ".299-.300*ca+1.250*sa," +
        ".587-.588*ca-1.050*sa," +
        ".114+.886*ca-.203*sa" +
    ");";
  }
}
