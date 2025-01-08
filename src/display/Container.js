import { removeFromArray, noopReturnsOne } from "../utils/helpers";
import { Item } from "./Item";

/**
 * Container
 * @extends {Item}
 * @property {Array<Item>} children
 * @property {number} useTint
 */
export class Container extends Item {
  /**
   * Creates an instance of Container.
   * @constructor
   */
  constructor() {
    super();

    this.RENDERING_TYPE = Container.RENDERING_TYPE;

    this.children = [];
    this.useTint = true;
  }

  /**
   * Set/Get parent
   * @type {Container}
   */
  get parent() {
    return this.$parent;
  }
  set parent(v) {
    super.parent = v;
    if (v) {
      this._getParentPremultipliedUseTint = v.getPremultipliedUseTint.bind(v);
      this._getParentPremultipliedAlpha = v.getPremultipliedAlpha.bind(v);
    } else
      this._getParentPremultipliedUseTint = this._getParentPremultipliedAlpha =
        noopReturnsOne;
  }

  /**
   * Get premultipliedUseTint
   * @type {Container}
   */
  getPremultipliedUseTint() {
    return this.useTint * this._getParentPremultipliedUseTint();
  }

  /**
   * Get premultipliedAlpha
   * @type {Container}
   */
  getPremultipliedAlpha() {
    return this.alpha * this._getParentPremultipliedAlpha();
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
   * Returns true, if the container contains the Item
   * @param {Item} child
   * @returns {boolean}
   */
  contains(child) {
    return this.getChildIndex(child) > -1;
  }

  /**
   * Add Item to the container
   * @param {Item} child
   */
  addChild(child) {
    this.addChildAt(child, this.children.length);
  }

  /**
   * Add Item to a specific index
   * @param {Item} child
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
   * Removes the Item from the container
   * @param {Item} child
   */
  removeChild(child) {
    if (child) {
      removeFromArray(this.children, child);
      child.parent = null;
    }
  }

  /**
   * Removes Item from index
   * @param {number} index
   */
  removeChildAt(index) {
    this.removeChild(this.getChildAt(index));
  }

  /**
   * Returns with a Item from a specific index
   * @param {number} index
   * @returns {Item}
   */
  getChildAt(index) {
    return this.children[index];
  }

  /**
   * Set child element index
   * @param {Item} child
   * @param {number} index
   */
  setChildIndex(child, index) {
    removeFromArray(this.children, child);
    this.children.splice(index, 0, child);
  }

  /**
   * Returns with the child element index
   * @param {Item} child
   * @returns {number}
   */
  getChildIndex(child) {
    return this.children.indexOf(child);
  }

  /**
   * Swap two children
   * @param {Item} childA
   * @param {Item} childB
   */
  swapChildren(childA, childB) {
    const childAIndex = this.getChildIndex(childA),
      childBIndex = this.getChildIndex(childB);
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
    const bounds = this.$bounds,
      children = this.children,
      l = children.length;

    bounds.x = bounds.y = 1 / 0;
    bounds.width = bounds.height = -1 / 0;

    for (let i = 0; i < l; i++) {
      const childBounds = children[i].getBounds();

      bounds.x = Math.min(bounds.x, childBounds.x);
      bounds.y = Math.min(bounds.y, childBounds.y);
      bounds.width = Math.max(bounds.width, childBounds.width);
      bounds.height = Math.max(bounds.height, childBounds.height);
    }

    return bounds;
  }
}

/**
 * Type "container"
 * @string
 */
Container.RENDERING_TYPE = "container";
