import { noop } from "../utils/helpers";
import { ItemTransformProps } from "../data/props/ItemTransformProps";
import { ColorProps } from "../data/props/ColorProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import "../geom/RectangleType";

/**
 * Item
 * @property {Item.Type} TYPE
 * @property {boolean} interactive
 * @property {boolean} renderable
 * @property {ItemTransformProps} transform
 * @property {ColorProps} color
 * @method callbackBeforeRender
 * @method callbackAfterRender
 */
export class Item {
  /**
   * Creates an instance of Item.
   * @constructor
   */
  constructor() {
    this.RENDERING_TYPE = Item.RENDERING_TYPE;

    this.matrixCache = Matrix3Utilities.identity();
    this.colorUpdateId = this.propsUpdateId = 0;
    this.transform = new this.$transformClass();
    this.color = new ColorProps();
    this.colorCache = [1, 1, 1, 1];
    this.interactive = false;
    this.alpha = 1;
    this.callbackBeforeRender = this.callbackAfterRender = noop;
    this._currentColorUpdateId = this._currentPropsUpdateId = -1;
    this._renderable = true;
    this.$bounds = { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Returns true if the item is renderable
   * @returns {boolean}
   */
  get renderable() {
    return this._renderable;
  }
  set renderable(v) {
    this._renderable = v;
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
    if (this.$parent !== v) {
      this.$parent = v;
      this._currentParentPropsUpdateId =
        this._currentParentColorUpdateId =
        this.$currentInverseMatrixPropsUpdateId =
        this.$currentAdditionalPropsUpdateId =
          -1;
    }
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
   *      onmouseover,
   *      onmouseout,
   *      onmousemove,
   *      onmousedown,
   *      onmouseup,
   *      onclick,
   *      ontouchstart,
   *      ontouchmove,
   *      touchend
   *    ] function
   * </pre>
   * @param {*} event
   */
  callEventHandler(target, event) {
    if (this.interactive) {
      const callback = this["on" + event.type];
      callback && callback(this, target, event);
    }

    this.$parent && this.$parent.callEventHandler(target, event);
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
    this.$parent && this.$parent.removeChild && this.$parent.removeChild(this);
  }

  /**
   * Update ItemTransformProps
   */
  update() {
    this._updateColor();
    const transform = this.transform;
    transform.updateRotation();
    transform.updateScale();
    const parent = this.$parent;

    (this._currentParentPropsUpdateId < parent.propsUpdateId ||
      this._currentPropsUpdateId < transform.updateId) &&
      this.$updateTransform(transform, parent);
  }

  /**
   * @ignore
   */
  get $transformClass() {
    return ItemTransformProps;
  }

  /**
   * @param {ItemTransformProps} transform
   * @param {Container} parent
   * @ignore
   */
  $updateTransform(transform, parent) {
    this._currentParentPropsUpdateId = parent.propsUpdateId;
    this._currentPropsUpdateId = transform.updateId;
    ++this.propsUpdateId;

    Matrix3Utilities.transform(parent.matrixCache, transform, this.matrixCache);
  }

  /**
   * @ignore
   */
  _updateColor() {
    const parent = this.$parent;
    const color = this.color;

    if (
      this._currentParentColorUpdateId < parent.colorUpdateId ||
      this._currentColorUpdateId < color.updateId
    ) {
      this._currentParentColorUpdateId = parent.colorUpdateId;
      this._currentColorUpdateId = color.updateId;
      ++this.colorUpdateId;

      const colorCache = this.colorCache;
      const parentColorCache = parent.colorCache;

      colorCache[0] = parentColorCache[0] * color.r;
      colorCache[1] = parentColorCache[1] * color.g;
      colorCache[2] = parentColorCache[2] * color.b;
      colorCache[3] = parentColorCache[3] * color.a;
    }
  }
}

/**
 * Type "item"
 * @string
 */
Item.RENDERING_TYPE = "item";
