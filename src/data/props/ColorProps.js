/**
 * Class for color properties
 * @property {boolean} updated
 * @property {Array<number>} cache
 */
export class ColorProps {
  /**
   * Creates an instance of ColorProps.
   * @constructor
   */
  constructor() {
    this.cache = [];
    this.set(1, 1, 1, 1);
  }

  /**
   * Set/Get red value
   * @type {number}
   */
  get r() {
    return this.cache[0];
  }
  set r(v) {
    this.cache[0] = v;
    this._colorUpdated = true;
  }

  /**
   * Set/Get green value
   * @type {number}
   */
  get g() {
    return this.cache[1];
  }
  set g(v) {
    this.cache[1] = v;
    this._colorUpdated = true;
  }

  /**
   * Set/Get blue value
   * @type {number}
   */
  get b() {
    return this.cache[2];
  }
  set b(v) {
    this.cache[2] = v;
    this._colorUpdated = true;
  }

  /**
   * Set/Get alpha value
   * @type {number}
   */
  get a() {
    return this.cache[3];
  }
  set a(v) {
    this.cache[3] = v;
    this._colorUpdated = true;
  }

  /**
   * Set all color values
   * @param {number} r - Red value
   * @param {number} g - Green value
   * @param {number} b - Blue value
   * @param {number} a - Alpha value
   */
  set(r, g, b, a) {
    this.cache[0] = r;
    this.cache[1] = g;
    this.cache[2] = b;
    this.cache[3] = a;
    this._colorUpdated = true;
  }

  /**
   * Update calculated color values
   */
  update() {
    this.updated = this._colorUpdated;
    this._colorUpdated = false;
  }
}
