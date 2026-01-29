import { ItemTransform } from "./ItemTransform";

/**
 * Class for light transform properties
 * @extends {ItemTransform}
 * @property {number} z
 */
export class LightTransform extends ItemTransform {
  /**
   * Creates an instance of LightTransform.
   * @constructor
   */
  constructor() {
    super();

    this.z = 0;
  }

  /**
   * <pre>
   *  Set/Get width
   *    - In the case of lights, the height value is the same as the width value
   * </pre>
   * @type {number}
   */
  get width() {
    return this.$width;
  }
  set width(v) {
    this.$width = this.$height = v;
    this.$updateScaleFv = this.$updateScale;
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this.$height;
  }
  set height(v) {
    this.width = v;
  }
}
