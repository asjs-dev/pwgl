import "../namespace.js";
import "./Item.js";

AGL.BaseDrawable = class extends AGL.Item {
  constructor(texture) {
    super();

    this._inverseMatrixCache = new Float32Array(6);

    this._corners = [
      AGL.Point.create(),
      AGL.Point.create(),
      AGL.Point.create(),
      AGL.Point.create()
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
    AGL.Matrix3.calcCorners(
      this.matrixCache,
      this._corners,
      this.stage.renderer
    );
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
      AGL.Matrix3.inverse(this.matrixCache, this._inverseMatrixCache);
      this._calcBounds();
    }
  }
}
