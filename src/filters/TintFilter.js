import { TintType } from "../rendering/TintType";
import { TINT_TYPE_SHADER } from "../utils/shaderUtils";
import { BaseFilter } from "./BaseFilter";

/**
 * Tint filter
 * @extends {BaseFilter}
 */
export class TintFilter extends BaseFilter {
  constructor(options = {}) {
    super(options);

    this.set(options.r ?? 1, options.g ?? 1, options.b ?? 1, options.a ?? 1);
    this.type = options.type ?? TintType.MULTIPLY;
  }

  get GLSL() {
    return TINT_TYPE_SHADER("uL[1].x", "oCl", "uL[0]");
  }

  /**
   * Set/Get red
   * @type {number}
   */
  get r() {
    return this.customData[0];
  }
  set r(v) {
    this.customData[0] = v;
  }

  /**
   * Set/Get green
   * @type {number}
   */
  get g() {
    return this.customData[1];
  }
  set g(v) {
    this.customData[1] = v;
  }

  /**
   * Set/Get blue
   * @type {number}
   */
  get b() {
    return this.customData[2];
  }
  set b(v) {
    this.customData[2] = v;
  }

  /**
   * Set/Get alpha
   * @type {number}
   */
  get a() {
    return this.customData[3];
  }
  set a(v) {
    this.customData[3] = v;
  }

  /**
   * Set/Get tint type
   * @type {number}
   */
  get type() {
    return this.customData[4];
  }
  set type(v) {
    this.customData[4] = v;
  }

  /**
   * Set all colors
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   */
  set(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
