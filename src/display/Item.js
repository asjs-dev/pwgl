import { emptyFunction } from "../utils/helpers.js";
import { ItemProps } from "../data/props/ItemProps.js";
import { ColorProps } from "../data/props/ColorProps.js";
import { Rect } from "../geom/Rect.js";
import { Matrix3 } from "../geom/Matrix3.js";
import { BaseItem } from "./BaseItem.js";

export class Item extends BaseItem {
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
    this._currentAdditionalPropsUpdateId = 0;

    this.callback = emptyFunction;

    this._bounds = Rect.create();
  }

  get stage() {
    return this._parent
      ? this._parent.stage
      : null;
  }

  get parent() { return this._parent; }
  set parent(v) {
    if (this._parent !== v) {
      this._parent = v;
      this._currentParentPropsUpdateId =
      this._currentParentColorUpdateId =
      this._currentAdditionalPropsUpdateId = 0;
    }
  }

  get callback() { return this._callback; }
  set callback(v) { this._callback = v || emptyFunction; }

  getBounds() {
    return this._bounds;
  }

  destruct() {
    this._parent && this._parent.removeChild && this._parent.removeChild(this);
    super.destruct();
  }

  update() {
    this._updateProps();
  }

  _updateProps() {
    const props = this.props;
    props.updateRotation();
    props.updateScale();
    const parent = this._parent;

    (
      this._currentParentPropsUpdateId < parent.propsUpdateId ||
      this._currentPropsUpdateId < props.updateId
    ) && this._updateTransform(props, parent);
  }

  _updateTransform(props, parent) {
    this._currentParentPropsUpdateId = parent.propsUpdateId;
    this._currentPropsUpdateId = props.updateId;
    ++this.propsUpdateId;

    Matrix3.transform(parent.matrixCache, props, this.matrixCache);
  }
}

Item.TYPE = "item";
