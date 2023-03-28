import { ItemProps } from "./ItemProps";

/**
 * Class for light properties
 * @extends {ItemProps}
 */
export class LightProps extends ItemProps {
  /**
   * Creates an instance of LightProps.
   * @constructor
   */
  constructor() {
    super();

    this.z = 0;
  }

  /**
   * Set/Get width
   *  - In the case of lights, the height value is the same as the width value
   * @type {number}
   */
  get width() {
    return this._width;
  }
  set width(v) {
    if (this._width !== v) {
      this._width = this._height = v;
      ++this._scaleUpdateId;
    }
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this._height;
  }
  set height(v) {}
}
