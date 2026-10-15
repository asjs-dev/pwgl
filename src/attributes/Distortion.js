/**
 * <pre>
 *  Class for distortion properties
 *  It moves the corners of the element. Each corner is an absolute position in the
 *  element's unit quad: (0, 0) is the top left, (1, 1) the bottom right corner.
 *  Defaults (no distortion): top left (0, 0), top right (1, 0),
 *  bottom right (1, 1), bottom left (0, 1).
 *  With distortTexture the texture is mapped projectively (perspective-correct) on
 *  convex quads; concave or self-intersecting quads fall back to an affine mapping.
 * </pre>
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
   *  Set/Get the top left corner's x position, relative to the element width
   *  Examples:
   *    - 0 - no distortion (default)
   *    - 0.5 - moves it to the middle of the top edge
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
   *  Set/Get the top left corner's y position, relative to the element height
   *  Examples:
   *    - 0 - no distortion (default)
   *    - 0.5 - moves it to the middle of the left edge
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
   *  Set/Get the top right corner's x position, relative to the element width
   *  Examples:
   *    - 1 - no distortion (default)
   *    - 0.5 - moves it to the middle of the top edge
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
   *  Set/Get the top right corner's y position, relative to the element height
   *  Examples:
   *    - 0 - no distortion (default)
   *    - 0.5 - moves it to the middle of the right edge
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
   *  Set/Get the bottom right corner's x position, relative to the element width
   *  Examples:
   *    - 1 - no distortion (default)
   *    - 0.5 - moves it to the middle of the bottom edge
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
   *  Set/Get the bottom right corner's y position, relative to the element height
   *  Examples:
   *    - 1 - no distortion (default)
   *    - 0.5 - moves it to the middle of the right edge
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
   *  Set/Get the bottom left corner's x position, relative to the element width
   *  Examples:
   *    - 0 - no distortion (default)
   *    - 0.5 - moves it to the middle of the bottom edge
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
   *  Set/Get the bottom left corner's y position, relative to the element height
   *  Examples:
   *    - 1 - no distortion (default)
   *    - 0.5 - moves it to the middle of the left edge
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
