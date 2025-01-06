import { BaseTransformProps } from "./BaseTransformProps";

/**
 * Class for texture transform properties
 * @extends {BaseTransformProps}
 * @property {Array<number>} repeatRandomCache
 */
export class TextureTransformProps extends BaseTransformProps {
  /**
   * Creates an instance of TextureTransformProps
   * @constructor
   */
  constructor() {
    super();

    this.repeatRandomCache = [0, 0, 0];
    this._repeatX = this._repeatY = 1;
  }

  /**
   * Get scaled width
   * @readonly
   * @type {number}
   */
  get scaledWidth() {
    return this._repeatX;
  }

  /**
   * Get scaled height
   * @readonly
   * @type {number}
   */
  get scaledHeight() {
    return this._repeatY;
  }

  /**
   * Set/Get repeat x
   * @type {number}
   */
  get repeatX() {
    return this._repeatX;
  }
  set repeatX(v) {
    this._repeatX = v;
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
    this._repeatY = v;
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
}
