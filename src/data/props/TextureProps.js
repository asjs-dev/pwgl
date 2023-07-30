import { BasePositioningProps } from "./BasePositioningProps";

/**
 * Class for texture properties
 * @extends {BasePositioningProps}
 */
export class TextureProps extends BasePositioningProps {
  /**
   * Creates an instance of TextureProps
   * @constructor
   */
  constructor() {
    super();

    this._repeatX = this._repeatY = 1;

    this.items = [0, 0, 0];
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
    if (this._repeatX !== v) {
      this._repeatX = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get repeat y
   * @type {number}
   */
  get repeatY() {
    return this._repeatY;
  }
  set repeatY(v) {
    if (this._repeatY !== v) {
      this._repeatY = v;
      ++this.updateId;
    }
  }

  /**
   * <pre>
   *  Set/Get repeat random rotation
   *    - If the texture is repeated, it will rotate randomly
   * </pre>
   * @type {number}
   */
  get repeatRandomRotation() {
    return this.items[0];
  }
  set repeatRandomRotation(v) {
    this.items[0] = v;
  }

  /**
   * <pre>
   *  Set/Get repeat random alpha
   *    - If the texture is repeated, it will randomly become transparent
   * </pre>
   * @type {number}
   */
  get repeatRandomAlpha() {
    return this.items[1];
  }
  set repeatRandomAlpha(v) {
    this.items[1] = v;
  }

  /**
   * <pre>
   *  Set/Get repeat random blur
   *    - If the texture is repeated, it will blur randomly
   * </pre>
   * @type {number}
   */
  get repeatRandomBlur() {
    return this.items[2];
  }
  set repeatRandomBlur(v) {
    this.items[2] = v;
  }
}
