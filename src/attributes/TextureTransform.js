import { BaseTransform } from "./BaseTransform";

/**
 * Class for texture transform properties
 * @extends {BaseTransform}
 * @property {Array<number>} repeatRandomCache
 */
export class TextureTransform extends BaseTransform {
  /**
   * Creates an instance of TextureTransform
   * @constructor
   */
  constructor() {
    super();

    this.repeatRandomCache = new Float32Array([0, 0, 0, 2]);
    this.repeatX = this.repeatY = 1;
  }

  /**
   * Set/Get repeat x
   * @type {number}
   */
  get repeatX() {
    return this._repeatX;
  }
  set repeatX(v) {
    this._repeatX = this.scaledWidth = v;
    this.$transformUpdated = true;
  }

  /**
   * Set/Get repeat y
   * @type {number}
   */
  get repeatY() {
    return this._repeatY;
  }
  set repeatY(v) {
    this._repeatY = this.scaledHeight = v;
    this.$transformUpdated = true;
  }

  /**
   * <pre>
   *  Set/Get repeat random rotation
   *    - If the texture is repeated, it will rotate randomly
   * </pre>
   * @type {number}
   */
  get repeatRandomRotation() {
    return this.repeatRandomCache[0];
  }
  set repeatRandomRotation(v) {
    this.repeatRandomCache[0] = v;
  }

  /**
   * <pre>
   *  Set/Get repeat random alpha
   *    - If the texture is repeated, it will randomly become transparent
   * </pre>
   * @type {number}
   */
  get repeatRandomAlpha() {
    return this.repeatRandomCache[1];
  }
  set repeatRandomAlpha(v) {
    this.repeatRandomCache[1] = v;
  }

  /**
   * <pre>
   *  Set/Get repeat random blur
   *    - If the texture is repeated, it will blur randomly
   * </pre>
   * @type {number}
   */
  get repeatRandomBlur() {
    return this.repeatRandomCache[2];
  }
  set repeatRandomBlur(v) {
    this.repeatRandomCache[2] = v;
  }

  /**
   * <pre>
   *  Set/Get repeat random offset
   * </pre>
   * @type {number}
   */
  get repeatRandomOffset() {
    return this.repeatRandomCache[3];
  }
  set repeatRandomOffset(v) {
    this.repeatRandomCache[3] = v;
  }
}
