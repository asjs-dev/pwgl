import { BaseProps } from "./BaseProps";

/**
 * Class for color properties
 * @extends {BaseProps}
 */
export class ColorProps extends BaseProps {
  /**
   * Creates an instance of ColorProps.
   * @constructor
   */
  constructor() {
    super();

    this.items = [1, 1, 1, 1];
  }

  /**
   * Set/Get red value
   * @type {number}
   */
  get r() {
    return this.items[0];
  }
  set r(v) {
    if (this.items[0] !== v) {
      this.items[0] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get green value
   * @type {number}
   */
  get g() {
    return this.items[1];
  }
  set g(v) {
    if (this.items[1] !== v) {
      this.items[1] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get blue value
   * @type {number}
   */
  get b() {
    return this.items[2];
  }
  set b(v) {
    if (this.items[2] !== v) {
      this.items[2] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get alpha value
   * @type {number}
   */
  get a() {
    return this.items[3];
  }
  set a(v) {
    if (this.items[3] !== v) {
      this.items[3] = v;
      ++this.updateId;
    }
  }

  /**
   * Set all color values
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
