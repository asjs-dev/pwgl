import { TextureInfo } from "../textures/TextureInfo";
import { BaseFilter } from "./BaseFilter";

// prettier-ignore
const _GLSL = "float " +
    "luA=oCl.a," +
    "luN=uL[0].x," +
    "luM=luN-1.;" +
  "vec3 " +
    "luC=clamp(oCl.rgb/max(luA,1e-4),0.,1.);" +
  "float " +
    "luB=luC.b*luM," +
    "luB0=floor(luB)," +
    "luB1=min(luB0+1.,luM);" +
  "vec2 " +
    "luP=vec2((luC.r*luM+.5)/(luN*luN),(luC.g*luM+.5)/luN);" +
  "oCl.rgb=mix(" +
    "texture(uH,luP+vec2(luB0/luN,0)).rgb," +
    "texture(uH,luP+vec2(luB1/luN,0)).rgb," +
    "luB-luB0" +
  ")*luA;";

/**
 * <pre>
 *  Color lookup table filter
 *    - Remaps colors through a 3D LUT stored as a horizontal strip texture
 *    - Strip layout: N slices of N x N pixels side by side (N² x N, e.g. 256 x 16 or 1024 x 32),
 *      red grows to the right inside a slice, green grows along the rows, blue selects the slice
 *    - The LUT texture must be opaque and keep the TextureInfo defaults
 *      (LINEAR filtering, CLAMP_TO_EDGE wrapping, no mipmaps)
 *    - Works on un-premultiplied colors, the alpha is left untouched
 *    - The intensity is unused, use mix to fade the effect
 * </pre>
 * @extends {BaseFilter}
 */
export class ColorLUTFilter extends BaseFilter {
  /**
   * Creates an instance of ColorLUTFilter.
   * @constructor
   * @param {object} options
   * @param {TextureInfo} options.texture - Required <br>
   *                                      - LUT strip texture, the shader samples whatever is bound without it
   * @param {number} options.lutSize - Default value 16 <br>
   *                                 - Size of one LUT slice (N)
   */
  constructor(options = {}) {
    super(options);

    this.texture = options.texture;
    this.lutSize = options.lutSize ?? 16;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get LUT slice size (N)
   * @type {number}
   */
  get lutSize() {
    return this.customData[0];
  }
  set lutSize(v) {
    this.customData[0] = v;
  }
}
