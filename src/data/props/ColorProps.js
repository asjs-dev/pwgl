/**
 * Class for color properties
 */
export class ColorProps {
  /**
   * Creates an instance of ColorProps.
   * @constructor
   */
  constructor() {
    this.updateId = 0;

    this.cache = [1, 1, 1, 1];
  }

  /**
   * Set/Get red value
   * @type {number}
   */
  get r() {
    return this.cache[0];
  }
  set r(v) {
    if (this.cache[0] !== v) {
      this.cache[0] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get green value
   * @type {number}
   */
  get g() {
    return this.cache[1];
  }
  set g(v) {
    if (this.cache[1] !== v) {
      this.cache[1] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get blue value
   * @type {number}
   */
  get b() {
    return this.cache[2];
  }
  set b(v) {
    if (this.cache[2] !== v) {
      this.cache[2] = v;
      ++this.updateId;
    }
  }

  /**
   * Set/Get alpha value
   * @type {number}
   */
  get a() {
    return this.cache[3];
  }
  set a(v) {
    if (this.cache[3] !== v) {
      this.cache[3] = v;
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
