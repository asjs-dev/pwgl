import { Matrix3Utilities } from "../geom/Matrix3Utilities";

/**
 * Base Item
 */
export class BaseItem {
  /**
   * Creates an instance of BaseItem.
   * @constructor
   */
  constructor() {
    this.interactive = false;
    this.matrixCache = Matrix3Utilities.identity();
    this.colorUpdateId = this.propsUpdateId = 0;
    this.colorCache = [1, 1, 1, 1];
  }

  /**
   * <pre>
   *  Handle event
   *    - It can handle mouse events if the item is interactive and has [onmouseover, onmouseout, onmousemove, onmousedown, onmouseup, onclick, ontouchstart, ontouchmove, touchend] function
   * </pre>
   * @param {*} event
   */
  callEventHandler(target, event) {
    if (this.interactive) {
      const functionName = event.type;
      const callback = this["on" + functionName];
      callback && callback(this, target, event);
    }

    this.$parent && this.$parent.callEventHandler(target, event);
  }

  /**
   * Destruct class
   */
  destruct() {}
}
