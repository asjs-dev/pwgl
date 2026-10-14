import { Matrix3Utilities } from "../math/Matrix3Utilities";
import { BatchRenderer } from "../renderers/BatchRenderer";
import { Container } from "./Container";
import { nextVersion } from "../utils/nextVersion";

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
   * Update color and the projection; the projection is recalculated after a renderer resize
   */
  update() {
    const { color, renderer } = this;
    const { $resizeVersion } = renderer;

    this.$premultipliedAlpha = this.alpha;
    this.$premultipliedUseTint = this.useTint;

    color.update();

    this.colorUpdated = color.updated;
    this.colorUpdated && (this.$colorVersion = nextVersion());

    this.transformUpdated = $resizeVersion !== this.$parentTransformVersion;

    if (this.transformUpdated) {
      this.$parentTransformVersion = $resizeVersion;
      this.$transformVersion = nextVersion();

      Matrix3Utilities.projection(this.matrixCache, renderer);
    }
  }
}
