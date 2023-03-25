import { Item } from "./Item.js";
import { Point } from "../geom/Point.js";
import { Matrix3 } from "../geom/Matrix3.js";

export class BaseDrawable extends Item {
  constructor(texture) {
    super();

    this._inverseMatrixCache = new Float32Array(6);

    this._corners = [
      Point.create(),
      Point.create(),
      Point.create(),
      Point.create(),
    ];
  }

  getCorners() {
    this._updateAdditionalData();
    return this._corners;
  }

  getBounds() {
    this._updateAdditionalData();
    return this._bounds;
  }

  _calcCorners() {
    Matrix3.calcCorners(this.matrixCache, this._corners, this.stage.renderer);
  }

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

  _updateAdditionalData() {
    if (this._currentAdditionalPropsUpdateId < this.propsUpdateId) {
      this._currentAdditionalPropsUpdateId = this.propsUpdateId;
      Matrix3.inverse(this.matrixCache, this._inverseMatrixCache);
      this._calcBounds();
    }
  }
}
