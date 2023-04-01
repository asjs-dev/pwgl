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
      this.$currentColorUpdateId =
      this._currentParentPropsUpdateId =
      this.$currentParentColorUpdateId =
      this.$currentAdditionalPropsUpdateId =
        0;

    this.callback = noop;

    this.$bounds = RectangleUtilities.create();
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
  /**
   * Set/Get render callback
   - It will be called when the Item is rendered
   */
  set callback(v) {
    this._callback = v || noop;
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
    super.destruct();
  }

  /**
   * Update ItemProps
   */
  update() {
    this.$updateProps();
  }

  /**
   * @ignore
   */
  $updateProps() {
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
