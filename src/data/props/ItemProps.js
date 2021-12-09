import "../../namespace.js";
import "./BasePositioningProps.js";

AGL.ItemProps = class extends AGL.BasePositioningProps {
  constructor() {
    super();

    this._scaleUpdateId =
    this._currentScaleUpdateId = 0;

    this.scaledWidth =
    this.scaledHeight =

    this._scaleX =
    this._scaleY =
    this._width =
    this._height =
    this.alpha = 1;
  }

  get scaleX() { return this._scaleX; }
  set scaleX(v) {
    if (this._scaleX !== v) {
      this._scaleX = v;
      ++this._scaleUpdateId;
    }
  }

  get scaleY() { return this._scaleY; }
  set scaleY(v) {
    if (this._scaleY !== v) {
      this._scaleY = v;
      ++this._scaleUpdateId;
    }
  }

  get width() { return this._width; }
  set width(v) {
    if (this._width !== v) {
      this._width = v;
      ++this._scaleUpdateId;
    }
  }

  get height() { return this._height; }
  set height(v) {
    if (this._height !== v) {
      this._height = v;
      ++this._scaleUpdateId;
    }
  }

  updateScale() {
    if (this._currentScaleUpdateId < this._scaleUpdateId) {
      this._currentScaleUpdateId = this._scaleUpdateId;
      ++this.updateId;

      this.scaledWidth = this._width * this._scaleX;
      this.scaledHeight = this._height * this._scaleY;
    }
  }
}
