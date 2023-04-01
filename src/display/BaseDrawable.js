import { Item } from "./Item";
import { PointUtilities } from "../geom/PointUtilities";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import "../geom/RectangleUtilities";

/**
 * Base drawable class
 * @extends {Item}
 */
export class BaseDrawable extends Item {
  /**
   * Creates an instance of BaseDrawable.
   * @constructor
   */
  constructor() {
    super();

    this.$inverseMatrixCache = new Float32Array(6);

    this.$corners = [
      PointUtilities.create(),
      PointUtilities.create(),
      PointUtilities.create(),
      PointUtilities.create(),
    ];
  }

  /**
   * Returns with the calculated corder positions
   * @returns {Array<Point>}
   */
  getCorners() {
    this.$updateAdditionalData();
    return this.$corners;
  }

  /**
   * Returns with bounds
   * @returns {Rectangle}
   */
  getBounds() {
    this.$updateAdditionalData();
    return this.$bounds;
  }

  /**
   * @ignore
   */
  $calcCorners() {
    Matrix3Utilities.calcCorners(this.matrixCache, this.$corners, this.stage.renderer);
  }

  /**
   * @ignore
   */
  $calcBounds() {
    this.$calcCorners();

    const corners = this.$corners;
    const bounds = this.$bounds;

    const a = corners[0];
    const b = corners[1];
    const c = corners[2];
    const d = corners[3];

    bounds.x = Math.min(a.x, b.x, c.x, d.x);
    bounds.y = Math.min(a.y, b.y, c.y, d.y);
    bounds.width = Math.max(a.x, b.x, c.x, d.x);
    bounds.height = Math.max(a.y, b.y, c.y, d.y);
  }

  /**
   * @ignore
   */
  $updateAdditionalData() {
    if (this.$currentAdditionalPropsUpdateId < this.propsUpdateId) {
      this.$currentAdditionalPropsUpdateId = this.propsUpdateId;
      Matrix3Utilities.inverse(this.matrixCache, this.$inverseMatrixCache);
      this.$calcBounds();
    }
  }
}
