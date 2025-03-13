import { BaseTextureFilter } from "./BaseTextureFilter";

const _GLSL = BaseTextureFilter.$createGLSL(
  "oCl.a*=v<4.?mskCl[int(v)]:(mskCl.r+mskCl.g+mskCl.b+mskCl.a)/4.;"
);

/**
 * Mask filter
 * @extends {BaseTextureFilter}
 */
export class MaskFilter extends BaseTextureFilter {
  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get type
   * @type {number}
   */
  get type() {
    return this.v[0];
  }
  set type(v) {
    this.v[0] = v;
  }
}

/**
 * Mask channel type
 * @member
 * @property {number} RED
 * @property {number} GREEN
 * @property {number} BLUE
 * @property {number} ALPHA
 */
MaskFilter.Type = {
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  ALPHA: 3,
  AVG: 4,
};
