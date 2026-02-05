import { arraySet } from "../../extensions/utils/arraySet";

/**
 * Base Filter
 * @property {boolean} on
 */
export class BaseFilter {
  /**
   * Creates an instance of BaseFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.on - Default value true <br>
   *                            - Turn on or off the filter
   * @param {number} options.intensity - Default value 1 <br>
   *                                   - Intensity of the filter <br>
   *                                   - If the intensity changes, then intensityX and intensityY also change simultaneously to the same value.
   * @param {number} options.intensityX - Default value 1 <br>
   *                                    - Intensity on the X coordinate
   * @param {number} options.intensityY - Default value 1 <br>
   *                                    - Intensity on the Y coordinate
   * @param {number} options.mix - Default value 1 <br>
   *                             - Mix between the original and the filtered image (0 - original, 1 - filtered image)
   * @param {number} options.isRadial - Default value false|0 <br>
   *                                  - Radial fade between the original and filtered image
   * @param {number} options.centerX - Default value 0.5 <br>
   *                                 - X center of the radial fade
   * @param {number} options.centerY - Default value 0.5 <br>
   *                                 - Y center of the radial fade
   * @param {number} options.size - Default value 1 <br>
   *                              - Size of the radial fade
   * @param {number} options.roundnes - Default value 1 <br>
   *                                  - Roundness of the radial fade
   * @param {number} options.transition - Default value 1 <br>
   *                                    - Transition of the radial fade
   * @param {number} options.kernels - Default value Float32Array(9) <br>
   *                                 - Kernel for convolution filters
   */
  constructor(options = {}) {
    this.data = new Float32Array(10);
    this.customData = new Float32Array(8);
    this.kernels = new Float32Array(9);
    
    this.on = options.on ?? true;
    this.intensity = options.intensity ?? 1;
    this.intensityX =
      options.intensityX ?? options.deg ?? this.intensity;
    this.intensityY = options.intensityY ?? this.intensity;
    this.mix = options.mix ?? 1;
    this.isRadial = options.isRadial ?? false;
    this.centerX = options.centerX ?? 0.5;
    this.centerY = options.centerY ?? 0.5;
    this.invertRadial = options.invertRadial ?? false;
    this.size = options.size ?? 1;
    this.roundness = options.roundness ?? 1;
    this.transition = options.transition ?? 1;
    options.kernels && arraySet(this.kernels, options.kernels);
  }

  /**
   * Set/Get intensity
   * @type {number}
   */
  get intensity() {
    return this.data[0];
  }
  set intensity(v) {
    this.data[0] = this.data[1] = v;
  }

  /**
   * <pre>
   *  Set/Get intendity x
   *    - Same as intensity
   * </pre>
   * @type {number}
   */
  get intensityX() {
    return this.data[0];
  }
  set intensityX(v) {
    this.data[0] = v;
  }

  /**
   * Set/Get intensity y
   * @type {number}
   */
  get intensityY() {
    return this.data[1];
  }
  set intensityY(v) {
    this.data[1] = v;
  }

  /**
   * Set/Get mix
   * @type {number}
   */
  get mix() {
    return this.data[2];
  }
  set mix(v) {
    this.data[2] = v;
  }

  /**
   * Set/Get is blur radial
   * @type {boolean}
   */
  get isRadial() {
    return this.data[3];
  }
  set isRadial(v) {
    this.data[3] = v;
  }

  /**
   * Set/Get center x
   * @type {number}
   */
  get centerX() {
    return this.data[4];
  }
  set centerX(v) {
    this.data[4] = v;
  }

  /**
   * Set/Get center y
   * @type {number}
   */
  get centerY() {
    return this.data[5];
  }
  set centerY(v) {
    this.data[5] = v;
  }

  /**
   * Set/Get invertRadial
   * @type {boolean}
   */
  get invertRadial() {
    return this.data[6];
  }
  set invertRadial(v) {
    this.data[6] = v;
  }

  /**
   * Set/Get size
   * @type {number}
   */
  get size() {
    return this.data[7];
  }
  set size(v) {
    this.data[7] = v;
  }

  /**
   * Set/Get roundness
   * @type {number}
   */
  get roundness() {
    return this.data[8];
  }
  set roundness(v) {
    this.data[8] = v;
  }

  /**
   * Set/Get transition
   * @type {number}
   */
  get transition() {
    return 1 / this.data[9];
  }
  set transition(v) {
    this.data[9] = 1 / v;
  }
}
