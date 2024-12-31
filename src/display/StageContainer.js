import { Container } from "./Container";
import { Item } from "./Item";
import { BatchRenderer } from "../renderer/BatchRenderer";

/**
 * Stage container
 * @extends {Container}
 * @property {BatchRenderer} renderer
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

    this.$parent = new Item();
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
   * @type {Item}
   */
  get parent() {
    return this.$parent;
  }

  /**
   * Get premultiplied useTint value
   * @type {Container}
   */
  getPremultipliedUseTint() {
    return this.useTint;
  }

  /**
   * Get premultiplied alpha
   * @type {Container}
   */
  getPremultipliedAlpha() {
    return this.alpha;
  }
}
