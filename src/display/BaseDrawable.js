import { Item } from "./Item";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import "../geom/PointType";
import "../geom/RectangleType";

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

    this.$corners = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  }

  /**
   * Set/Get parent
   * @type {Container}
   */
  get parent() {
    return this.$parent;
  }
  set parent(v) {
    if (this.$parent !== v) {
      super.parent = v;
      this._currentAdditionalPropsUpdateId = -1;
    }
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
    Matrix3Utilities.calcCorners(
      this.matrixCache,
      this.$corners,
      this.stage.renderer
    );
  }

  /**
   * @ignore
   */
  $updateAdditionalData() {
    if (
      this.renderable &&
      this._currentAdditionalPropsUpdateId < this.propsUpdateId
    ) {
      this._currentAdditionalPropsUpdateId = this.propsUpdateId;
      this._calcBounds();
      return true;
    }
  }

  /**
   * @ignore
   */
  _calcBounds() {
    this.$calcCorners();

    const corners = this.$corners,
      bounds = this.$bounds,
      a = corners[0],
      b = corners[1],
      c = corners[2],
      d = corners[3];

    bounds.x = Math.min(a.x, b.x, c.x, d.x);
    bounds.y = Math.min(a.y, b.y, c.y, d.y);
    bounds.width = Math.max(a.x, b.x, c.x, d.x);
    bounds.height = Math.max(a.y, b.y, c.y, d.y);
  }
}
