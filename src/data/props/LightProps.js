import { ItemProps } from "./ItemProps.js";

export class LightProps extends ItemProps {
  constructor() {
    super();

    this.z = 0;
  }

  get width() {
    return this._width;
  }
  set width(v) {
    if (this._width !== v) {
      this._width = this._height = v;
      ++this._scaleUpdateId;
    }
  }

  get height() {
    return this._height;
  }
  set height(v) {}
}
