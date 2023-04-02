import { removeFromArray } from "../utils/helpers";
import { BaseItem } from "./BaseItem";
import { Item } from "./Item";

/**
 * Container
 * @extends {Item}
 */
export class Container extends Item {
  /**
   * Creates an instance of Container.
   * @constructor
   */
  constructor() {
    super();

    this.TYPE = Container.TYPE;

    this.children = [];
  }

  /**
   * Destruct class
   */
  destruct() {
    this.empty();
    super.destruct();
  }

  /**
   * Emptying the container
   */
  empty() {
    while (this.children.length) this.removeChildAt(0);
  }

  /**
   * Returns true, if the container contains the BaseItem
   * @param {BaseItem} child
   * @returns {boolean}
   */
  contains(child) {
    return this.getChildIndex(child) > -1;
  }

  /**
   * Add BaseItem to the container
   * @param {BaseItem} child
   */
  addChild(child) {
    this.addChildAt(child, this.children.length);
  }

  /**
   * Add BaseItem to a specific index
   * @param {BaseItem} child
   * @param {number} index
   */
  addChildAt(child, index) {
    if (child) {
      child.parent && child.parent.removeChild(child);
      this.children.push(child);
      this.setChildIndex(child, index);
      child.parent = this;
    }
  }

  /**
   * Removes the BaseItem from the container
   * @param {BaseItem} child
   */
  removeChild(child) {
    if (child) {
      removeFromArray(this.children, child);
      child.parent = null;
    }
  }

  /**
   * Removes BaseItem from index
   * @param {number} index
   */
  removeChildAt(index) {
    this.removeChild(this.getChildAt(index));
  }

  /**
   * Returns with a BaseItem from a specific index
   * @param {number} index
   * @returns {BaseItem}
   */
  getChildAt(index) {
    return this.children[index];
  }

  /**
   * Set child element index
   * @param {BaseItem} child
   * @param {number} index
   */
  setChildIndex(child, index) {
    removeFromArray(this.children, child);
    this.children.splice(index, 0, child);
  }

  /**
   * Returns with the child element index
   * @param {BaseItem} child
   * @returns {number}
   */
  getChildIndex(child) {
    return this.children.indexOf(child);
  }

  /**
   * Swap two children
   * @param {BaseItem} childA
   * @param {BaseItem} childB
   */
  swapChildren(childA, childB) {
    const childAIndex = this.getChildIndex(childA);
    const childBIndex = this.getChildIndex(childB);
    if (childAIndex > -1 && childBIndex > -1) {
      this.setChildIndex(childA, childBIndex);
      this.setChildIndex(childB, childAIndex);
    }
  }

  /**
   * Returns with the bounds of the container
   * @returns {Rectangle}
   */
  getBounds() {
    const bounds = this.$bounds;

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

  /**
   * Update container data
   */
  update() {
    this.$updateProps();
    this._updateColor();
  }

  /**
   * Returns with the permultiplied alpha
   * @readonly
   * @type {number}
   */
  get premultipliedAlpha() {
    return this.props.alpha * this.$parent.premultipliedAlpha;
  }

  /**
   * @ignore
   */
  _updateColor() {
    const parent = this.$parent;
    const color = this.color;

    if (
      this.$currentParentColorUpdateId < parent.colorUpdateId ||
      this.$currentColorUpdateId < color.updateId
    ) {
      this.$currentColorUpdateId = color.updateId;
      this.$currentParentColorUpdateId = parent.colorUpdateId;
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
 * Type "container"
 * @string
 */
Container.TYPE = "container";
