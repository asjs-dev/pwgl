import { BasePositioningProps } from "./BasePositioningProps.js";

export class TextureProps extends BasePositioningProps {
  constructor() {
    super();

    this._repeatX = this._repeatY = 1;

    this.items = [0, 0, 0];
  }

  get scaledWidth() {
    return this._repeatX;
  }

  get scaledHeight() {
    return this._repeatY;
  }

  get repeatX() {
    return this._repeatX;
  }
  set repeatX(v) {
    if (this._repeatX !== v) {
      this._repeatX = v;
      ++this.updateId;
    }
  }

  get repeatY() {
    return this._repeatY;
  }
  set repeatY(v) {
    if (this._repeatY !== v) {
      this._repeatY = v;
      ++this.updateId;
    }
  }

  get repeatRandomRotation() {
    return this.items[0];
  }
  set repeatRandomRotation(v) {
    this.items[0] = v;
  }

  get repeatRandomAlpha() {
    return this.items[1];
  }
  set repeatRandomAlpha(v) {
    this.items[1] = v;
  }

  get repeatRandomBlur() {
    return this.items[2];
  }
  set repeatRandomBlur(v) {
    this.items[2] = v;
  }
}
