import { Container } from "./Container";
import { BaseItem } from "./BaseItem";
import { BatchRenderer } from "../renderer/BatchRenderer";

/**
 * Stage container
 * @extends {Container}
 */
export class StageContainer extends Container {
  /**
   * Creates an instance of StageContainer.
   * @constructor
   * @param {BatchRenderer} renderer
   */
  constructor(renderer) {
    super();

    this.renderer = renderer;
    this.$parent = new BaseItem();
  }

  /**
   * Get stage container
   * @readonly
   * @type {this}
   */
  get stage() {
    return this;
  }

  /**
   * Get parent
   * @readonly
   * @type {BaseItem}
   */
  get parent() {
    return this.$parent;
  }

  /**
   * Get premultiplied alpha
   * @readonly
   * @type {number}
   */
  get premultipliedAlpha() {
    return this.props.alpha;
  }
}
