import { removeFromArray } from "../utils/helpers";
import { Item } from "./Item";

/**
 * Container
 * @extends {Item}
 * @property {Array<Item>} children
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
  }

  /**
   * Returns with the permultiplied alpha
   * @readonly
   * @type {number}
   */
  get premultipliedAlpha() {
    return this.alpha * this.$parent.premultipliedAlpha;
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
    const children = this.children;

    bounds.x = bounds.y = 1 / 0;
    bounds.width = bounds.height = -1 / 0;

    for (let i = 0, l = children.length; i < l; ++i) {
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
