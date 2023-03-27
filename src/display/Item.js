import { noop } from "../utils/helpers";
import { ItemProps } from "../data/props/ItemProps";
import { ColorProps } from "../data/props/ColorProps";
import { RectangleUtilities } from "../geom/RectangleUtilities";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { BaseItem } from "./BaseItem";

/**
 * Item
 * @extends {BaseItem}
 */
export class Item extends BaseItem {
  /**
   * Creates an instance of Item.
   * @constructor
   */
  constructor() {
    super();

    this.TYPE = Item.TYPE;

    this.renderable = true;

    this.props = new ItemProps();
    this.color = new ColorProps();

    this._currentPropsUpdateId =
      this._currentColorUpdateId =
      this._currentParentPropsUpdateId =
      this._currentParentColorUpdateId =
      this._currentAdditionalPropsUpdateId =
        0;

    this.callback = noop;

    this._bounds = RectangleUtilities.create();
  }

  /**
   * Get StageContainer
   * @readonly
   * @type {StageContainer}
   */
  get stage() {
    return this._parent ? this._parent.stage : null;
  }

  /**
   * Set/Get parent
   * @type {Container}
   */
  get parent() {
    return this._parent;
  }
  set parent(v) {
    if (this._parent !== v) {
      this._parent = v;
      this._currentParentPropsUpdateId =
        this._currentParentColorUpdateId =
        this._currentAdditionalPropsUpdateId =
          0;
    }
  }

  /**
   * Set/Get render callback
   *  - It will be called when the Item is rendered
   * @type {function}
   */
  get callback() {
    return this._callback;
  }
  set callback(v) {
    this._callback = v || noop;
  }

  /**
   * Returns with the Item bounds
   * @returns {Rectangle}
   */
  getBounds() {
    return this._bounds;
  }

  /**
   * Destruct class
   */
  destruct() {
    this._parent && this._parent.removeChild && this._parent.removeChild(this);
    super.destruct();
  }

  /**
   * Update ItemProps
   */
  update() {
    this._updateProps();
  }

  /**
   * @ignore
   */
  _updateProps() {
    const props = this.props;
    props.updateRotation();
    props.updateScale();
    const parent = this._parent;

    (this._currentParentPropsUpdateId < parent.propsUpdateId ||
      this._currentPropsUpdateId < props.updateId) &&
      this._updateTransform(props, parent);
  }

  /**
   * @param {ItemProps} props
   * @param {Container} parent
   * @ignore
   */
  _updateTransform(props, parent) {
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
