import { ItemTransformProps } from "./ItemTransformProps";

/**
 * Class for light transform properties
 * @extends {ItemTransformProps}
 * @property {number} z
 */
export class LightTransformProps extends ItemTransformProps {
  /**
   * Creates an instance of LightTransformProps.
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
