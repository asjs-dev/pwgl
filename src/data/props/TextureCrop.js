import "../../namespace.js";
import "./BaseProps.js";

AGL.TextureCrop = class extends AGL.BaseProps {
  constructor() {
    super();

    this._currentUpdateId = 0;

    this.items = [0, 0, 1, 1];

    this._width =
    this._height = 1;
  }

  get x() { return this.items[0]; }
  set x(v) {
    if (this.items[0] !== v) {
      this.items[0] = v;
      ++this.updateId;
    }
  }

  get y() { return this.items[1]; }
  set y(v) {
    if (this.items[1] !== v) {
      this.items[1] = v;
      ++this.updateId;
    }
  }

  get width() { return this._width; }
  set width(v) {
    if (this._width !== v) {
      this._width = v;
      ++this.updateId;
    }
  }

  get height() { return this._height; }
  set height(v) {
    if (this._height !== v) {
      this._height = v;
      ++this.updateId;
    }
  }

  updateCrop() {
    if (this._currentUpdateId < this.updateId) {
      this._currentUpdateId = this.updateId;

      this.items[2] = this._width - this.items[0];
      this.items[3] = this._height - this.items[1];
    }
  }

  setRect(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }
}
