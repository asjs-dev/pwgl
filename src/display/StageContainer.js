import { Container } from "./Container";
import { BatchRenderer } from "../renderer/BatchRenderer";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";

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
    this.colorCache = this.color.cache;
    delete this.parent;
    delete this.transform;
  }

  /**
   * Get stage container
   * @readonly
   * @type {StageContainer}
   */
  get stage() {
    return this;
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

  update() {
    const color = this.color,
      renderer = this.renderer;

    color.update();

    this.colorUpdated = color.updated;

    this.transformUpdated = renderer.resized;

    this.transformUpdated &&
      Matrix3Utilities.projection(this.matrixCache, renderer);
  }
}
