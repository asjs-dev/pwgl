import { removeFromArray } from "../utils/helpers.js";
import { Item } from "./Item.js";

export class Container extends Item {
  constructor() {
    super();

    this.TYPE = Container.TYPE;

    this.children = [];
  }

  destruct() {
    this.empty();
    super.destruct();
  }

  empty() {
    while (this.children.length) this.removeChildAt(0);
  }

  contains(child) {
    return this.getChildIndex(child) > -1;
  }

  addChild(child) {
    this.addChildAt(child, this.children.length);
  }

  addChildAt(child, index) {
    if (child) {
      child.parent && child.parent.removeChild(child);
      this.children.push(child);
      this.setChildIndex(child, index);
      child.parent = this;
    }
  }

  removeChild(child) {
    if (child) {
      removeFromArray(this.children, child);
      child.parent = null;
    }
  }

  removeChildAt(index) {
    this.removeChild(this.getChildAt(index));
  }

  getChildAt(index) {
    return this.children[index];
  }

  setChildIndex(child, index) {
    removeFromArray(this.children, child);
    this.children.splice(index, 0, child);
  }

  getChildIndex(child) {
    return this.children.indexOf(child);
  }

  swapChildren(childA, childB) {
    const childAIndex = this.getChildIndex(childA);
    const childBIndex = this.getChildIndex(childB);
    if (childAIndex > -1 && childBIndex > -1) {
      this.setChildIndex(childA, childBIndex);
      this.setChildIndex(childB, childAIndex);
    }
  }

  getBounds() {
    const bounds = this._bounds;

    bounds.x = bounds.y = 1 / 0;
    bounds.width = bounds.height = -1 / 0;

    for (let i = 0, l = this.children.length; i < l; ++i) {
      const childBounds = this.children[i].getBounds();

      bounds.x = Math.min(bounds.x, childBounds.x);
      bounds.y = Math.min(bounds.y, childBounds.y);
      bounds.width = Math.max(bounds.width, childBounds.width);
      bounds.height = Math.max(bounds.height, childBounds.height);
    }

    return bounds;
  }

  update() {
    this._updateProps();
    this._updateColor();
  }

  get premultipliedAlpha() {
    return this.props.alpha * this._parent.premultipliedAlpha;
  }

  _updateColor() {
    const parent = this._parent;
    const color = this.color;

    if (
      this._currentParentColorUpdateId < parent.colorUpdateId ||
      this._currentColorUpdateId < color.updateId
    ) {
      this._currentColorUpdateId = color.updateId;
      this._currentParentColorUpdateId = parent.colorUpdateId;
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

Container.TYPE = "container";
