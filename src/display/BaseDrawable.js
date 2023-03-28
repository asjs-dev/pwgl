import { Item } from "./Item";
import { PointUtilities } from "../geom/PointUtilities";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { TextureInfo } from "../data/texture/TextureInfo";
import "../geom/RectangleUtilities";

/**
 * Base drawable class
 * @extends {Item}
 */
export class BaseDrawable extends Item {
  /**
   * Creates an instance of BaseDrawable.
   * @constructor
   * @param {TextureInfo} texture
   */
  constructor(texture) {
    super();

    this._inverseMatrixCache = new Float32Array(6);

    this._corners = [
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
    this._updateAdditionalData();
    return this._corners;
  }

  /**
   * Returns with bounds
   * @returns {Rectangle}
   */
  getBounds() {
    this._updateAdditionalData();
    return this._bounds;
  }

  /**
   * @ignore
   */
  _calcCorners() {
    Matrix3Utilities.calcCorners(this.matrixCache, this._corners, this.stage.renderer);
  }

  /**
   * @ignore
   */
  _calcBounds() {
    this._calcCorners();

    const corners = this._corners;
    const bounds = this._bounds;

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
  _updateAdditionalData() {
    if (this._currentAdditionalPropsUpdateId < this.propsUpdateId) {
      this._currentAdditionalPropsUpdateId = this.propsUpdateId;
      Matrix3Utilities.inverse(this.matrixCache, this._inverseMatrixCache);
      this._calcBounds();
    }
  }
}
