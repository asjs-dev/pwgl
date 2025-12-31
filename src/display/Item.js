import { noop } from "../../extensions/utils/noop";
import { ItemTransformProps } from "../data/props/ItemTransformProps";
import { ColorProps } from "../data/props/ColorProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import "../geom/RectangleType";

/**
 * Item
 * @property {Item.Type} TYPE
 * @property {Array<number>} matrixCache
 * @property {Array<number>} colorCache
 * @property {boolean} interactive
 * @property {boolean} renderable
 * @property {ItemTransformProps} transform
 * @property {ColorProps} color
 * @property {number} alpha
 * @property {boolean} transformUpdated
 * @property {boolean} colorUpdated
 * @property {function} callbackBeforeRender
 * @property {function} callbackAfterRender
 */
export class Item {
  /**
   * Creates an instance of Item.
   * @constructor
   */
  constructor() {
    this.RENDERING_TYPE = Item.RENDERING_TYPE;

    this.matrixCache = Matrix3Utilities.identity();
    this.colorCache = [1, 1, 1, 1];
    this.transform = new this.$transformClass();
    this.color = new ColorProps();
    this.alpha = 1;
    this.callbackBeforeRender = this.callbackAfterRender = noop;
    this.renderable = true;
    this.$bounds = { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Get StageContainer
   * @readonly
   * @type {StageContainer}
   */
  get stage() {
    return this.$parent ? this.$parent.stage : null;
  }

  /**
   * Set/Get parent
   * @type {Container}
   */
  get parent() {
    return this.$parent;
  }
  set parent(v) {
    this.$parent = v;
    this._parentChanged = true;
  }

  /**
   * <pre>
   *  Set/Get before render callback
   *    - It will be called before the Item rendered
   * </pre>
   * @type {function}
   */
  get callbackBeforeRender() {
    return this._callbackBeforeRender;
  }
  set callbackBeforeRender(v) {
    this._callbackBeforeRender = v ?? noop;
  }

  /**
   * <pre>
   *  Set/Get after render callback
   *    - It will be called after the Item rendered
   * </pre>
   * @type {function}
   */
  get callbackAfterRender() {
    return this._callbackAfterRender;
  }
  set callbackAfterRender(v) {
    this._callbackAfterRender = v ?? noop;
  }

  /**
   * <pre>
   *  Handle event
   *    - It can handle mouse events if the item is interactive and has [
   *      onPointerOver,
   *      onPointerOut,
   *      onPointerMove,
   *      onPointerDown,
   *      onPointerUp,
   *      onPointerClick
   *    ] function
   * </pre>
   * @param {*} event
   */
  callEventHandler(target, event) {
    if (this.interactive) {
      const callback = this["on" + event.type];
      callback && callback(this, target, event);
    }

    const parent = this.$parent;
    parent && parent.callEventHandler(target, event);
  }

  /**
   * Returns with the Item bounds
   * @returns {Rectangle}
   */
  getBounds() {
    return this.$bounds;
  }

  /**
   * Destruct class
   */
  destruct() {
    this.remove();
  }

  /**
   * Remove Item from parent
   */
  remove() {
    const parent = this.$parent;
    parent && parent.removeChild(this);
  }

  /**
   * Update color and transform values
   */
  update() {
    const transform = this.transform,
      color = this.color,
      parent = this.$parent,
      parentChanged = this._parentChanged;

    this._parentChanged = false;

    color.update();

    this.colorUpdated = parentChanged || color.updated || parent.colorUpdated;

    if (this.colorUpdated) {
      const colorCache = this.colorCache,
        originalColorCache = color.cache,
        parentColorCache = parent.colorCache;

      colorCache[0] = parentColorCache[0] * originalColorCache[0];
      colorCache[1] = parentColorCache[1] * originalColorCache[1];
      colorCache[2] = parentColorCache[2] * originalColorCache[2];
      colorCache[3] = parentColorCache[3] * originalColorCache[3];
    }

    transform.update();

    this.transformUpdated =
      parentChanged || transform.updated || parent.transformUpdated;

    this.transformUpdated &&
      Matrix3Utilities.transform(
        this.matrixCache,
        parent.matrixCache,
        transform
      );
  }

  /**
   * @ignore
   */
  get $transformClass() {
    return ItemTransformProps;
  }
}

/**
 * Type "item"
 * @string
 */
Item.RENDERING_TYPE = "item";
