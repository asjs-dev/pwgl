/**
 * <pre>
 *  Class for distortion properties
 *  It distorts the corners of the elements
 * <pre>
 */
export class DistortionProps {
  /**
   * Creates an instance of DistortionProps.
   * @constructor
   */
  constructor() {
    this.distortTexture = true;

    // prettier-ignore
    this.items = [
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ];
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
    return this.items[0];
  }
  set topLeftX(v) {
    this.items[0] = v;
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
    return this.items[1];
  }
  set topLeftY(v) {
    this.items[1] = v;
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
    return this.items[2];
  }
  set topRightX(v) {
    this.items[2] = v;
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
    return this.items[3];
  }
  set topRightY(v) {
    this.items[3] = v;
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
    return this.items[4];
  }
  set bottomRightX(v) {
    this.items[4] = v;
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
    return this.items[5];
  }
  set bottomRightY(v) {
    this.items[5] = v;
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
    return this.items[6];
  }
  set bottomLeftX(v) {
    this.items[6] = v;
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
    return this.items[7];
  }
  set bottomLeftY(v) {
    this.items[7] = v;
  }
}
