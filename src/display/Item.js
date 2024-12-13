import { noop } from "../utils/helpers";
import { ItemProps } from "../data/props/ItemProps";
import { ColorProps } from "../data/props/ColorProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import "../geom/RectangleType";

/**
 * Item
 * @property {Item.Type} TYPE
 * @property {boolean} interactive
 * @property {boolean} renderable
 * @property {ItemProps} props
 * @property {ColorProps} color
 */
export class Item {
  /**
   * Creates an instance of Item.
   * @constructor
   */
  constructor() {
    this.TYPE = Item.TYPE;

    this.interactive = false;
    this.matrixCache = Matrix3Utilities.identity();
    this.colorUpdateId = this.propsUpdateId = 0;
    this.colorCache = [1, 1, 1, 1];

    this.renderable = true;

    this.props = new ItemProps();
    this.color = new ColorProps();

    this._currentPropsUpdateId =
      this.$currentColorUpdateId =
      this._currentParentPropsUpdateId =
      this.$currentParentColorUpdateId =
      this.$currentAdditionalPropsUpdateId =
      this.$currentInverseMatrixPropsUpdateId =
        -1;

    this.callbackBeforeRender = this.callbackAfterRender = noop;

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
  /**
   * Set/Get parent
   */
  set parent(v) {
    if (this.$parent !== v) {
      this.$parent = v;
      this._currentParentPropsUpdateId =
        this.$currentParentColorUpdateId =
        this.$currentAdditionalPropsUpdateId =
        this.$currentInverseMatrixPropsUpdateId =
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
   * Update ItemProps
   */
  update() {
    const props = this.props;
    props.updateRotation();
    props.updateScale();
    const parent = this.$parent;

    (this._currentParentPropsUpdateId < parent.propsUpdateId ||
      this._currentPropsUpdateId < props.updateId) &&
      this.$updateTransform(props, parent);
  }

  /**
   * @param {ItemProps} props
   * @param {Container} parent
   * @ignore
   */
  $updateTransform(props, parent) {
    this._currentParentPropsUpdateId = parent.propsUpdateId;
    this._currentPropsUpdateId = props.updateId;
    ++this.propsUpdateId;

    Matrix3Utilities.transform(parent.matrixCache, props, this.matrixCache);
  }
}

/**
 * Type "item"
 * @string
 */
Item.TYPE = "item";
