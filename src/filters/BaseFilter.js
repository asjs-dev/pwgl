/**
 * Base Filter
 */
export class BaseFilter {
  /**
   * Creates an instance of BaseFilter.
   * @constructor
   * @param {number} type
   * @param {number} subType
   * @param {number} intensity
   */
  constructor(type, subType, intensity) {
    this.TYPE = type;
    this.SUB_TYPE = subType;
    this.on = true;

    this.v = new Float32Array(9);

    this.kernels = new Float32Array(16);

    this.intensity = intensity || 0;
  }

  /**
   * Set/Get intensity
   * @type {number}
   */
  get intensity() {
    return this.v[0];
  }
  set intensity(v) {
    this.v[0] = v;
  }

  /**
   * Set/Get intendity x
   *  - Same as intensity
   * @type {number}
   */
  get intensityX() {
    return this.v[0];
  }
  set intensityX(v) {
    this.v[0] = v;
  }

  /**
   * Set/Get intensity y
   * @type {number}
   */
  get intensityY() {
    return this.v[1];
  }
  set intensityY(v) {
    this.v[1] = v;
  }

  /**
   * Set/Get r
   * @type {number}
   */
  get r() {
    return this.v[2];
  }
  set r(v) {
    this.v[2] = v;
  }

  /**
   * Set/Get g
   * @type {number}
   */
  get g() {
    return this.v[3];
  }
  set g(v) {
    this.v[3] = v;
  }

  /**
   * Set/Get b
   * @type {number}
   */
  get b() {
    return this.v[4];
  }
  set b(v) {
    this.v[4] = v;
  }
}
