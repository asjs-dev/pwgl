import { BaseTextureFilter } from "./BaseTextureFilter";

const _GLSL = BaseTextureFilter.$createGLSL(
  "int v2=int(uL[1].z);" +
  "oCl.a*=v2<4?txCl[v2]:(txCl.r+txCl.g+txCl.b+txCl.a)/4.;"
);

/**
 * Mask filter
 * @extends {BaseTextureFilter}
 */
export class MaskFilter extends BaseTextureFilter {
  constructor(options) {
    super(options);

    this.type = options.type ?? MaskFilter.Type.RED;
  }

  get GLSL() {
    return _GLSL;
  }

  /**
   * Set/Get type
   * @type {number}
   */
  get type() {
    return this.customData[6];
  }
  set type(v) {
    this.customData[6] = v;
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
