/**
 * <pre>
 *  Class for distortion properties
 *  It distorts the corners of the elements
 * <pre>
 * @property {boolean} distortTexture
 * @property {Array<number>} cache
 */
export class Distortion {
  /**
   * Creates an instance of Distortion.
   * @constructor
   */
  constructor() {
    this.distortTexture = true;
    // prettier-ignore
    this.cache = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ]);
  }

  /**
   * <pre>
   *  Set/Get top left x value
   *  Examples:
   *    - 0 - no distortion
   *    - 0.5 - push the top left corners x position with the half of the element width
   * </pre>
   * @type {number}
   */
  get topLeftX() {
    return this.cache[0];
  }
  set topLeftX(v) {
    this.cache[0] = v;
  }

  /**
   * <pre>
   *  Set/Get top left y value
   *  Examples:
   *    - 0 - no distortion
   *    - 0.5 - push the top left corners y position with the half of the element height
   * </pre>
   * @type {number}
   */
  get topLeftY() {
    return this.cache[1];
  }
  set topLeftY(v) {
    this.cache[1] = v;
  }

  /**
   * <pre>
   *  Set/Get top right x value
   *  Examples:
   *    - -0 - no distortion
   *    - -0.5 - push the top right corners x position with the half of the element width
   * </pre>
   * @type {number}
   */
  get topRightX() {
    return this.cache[2];
  }
  set topRightX(v) {
    this.cache[2] = v;
  }

  /**
   * <pre>
   *  Set/Get top right y value
   *  Examples:
   *    - 0 - no distortion
   *    - 0.5 - push the top right corners y position with the half of the element height
   * </pre>
   * @type {number}
   */
  get topRightY() {
    return this.cache[3];
  }
  set topRightY(v) {
    this.cache[3] = v;
  }

  /**
   * <pre>
   *  Set/Get bottom right x value
   *  Examples:
   *    - -0 - no distortion
   *    - -0.5 - push the bottom right corners x position with the half of the element width
   * </pre>
   * @type {number}
   */
  get bottomRightX() {
    return this.cache[4];
  }
  set bottomRightX(v) {
    this.cache[4] = v;
  }

  /**
   * <pre>
   *  Set/Get bottom right y value
   *  Examples:
   *    - -0 - no distortion
   *    - -0.5 - push the bottom right corners y position with the half of the element height
   * </pre>
   * @type {number}
   */
  get bottomRightY() {
    return this.cache[5];
  }
  set bottomRightY(v) {
    this.cache[5] = v;
  }

  /**
   * <pre>
   *  Set/Get bottom left x value
   *  Examples:
   *    - 0 - no distortion
   *    - 0.5 - push the bottom left corners x position with the half of the element width
   * </pre>
   * @type {number}
   */
  get bottomLeftX() {
    return this.cache[6];
  }
  set bottomLeftX(v) {
    this.cache[6] = v;
  }

  /**
   * <pre>
   *  Set/Get bottom left y value
   *  Examples:
   *    - -0 - no distortion
   *    - -0.5 - push the bottom left corners y position with the half of the element height
   * </pre>
   * @type {number}
   */
  get bottomLeftY() {
    return this.cache[7];
  }
  set bottomLeftY(v) {
    this.cache[7] = v;
  }
}
