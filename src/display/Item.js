import { emptyFunction } from "../utils/helpers.js";
import "../namespace.js";
import "../data/props/ItemProps.js";
import "../data/props/ColorProps.js";
import "../geom/Rect.js";
import "./BaseItem.js";

AGL.Item = class extends AGL.BaseItem {
  constructor() {
    super();

    this.TYPE = AGL.Item.TYPE;

    this.renderable = true;

    this.props = new AGL.ItemProps();
    this.color = new AGL.ColorProps();

    this._currentPropsUpdateId =
    this._currentColorUpdateId =
    this._currentParentPropsUpdateId =
    this._currentParentColorUpdateId =
    this._currentAdditionalPropsUpdateId = 0;

    this.callback = emptyFunction;

    this._bounds = AGL.Rect.create();
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

    AGL.Matrix3.transform(parent.matrixCache, props, this.matrixCache);
  }
}

AGL.Item.TYPE = "item";
