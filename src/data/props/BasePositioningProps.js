import { BaseProps } from "./BaseProps.js";

export class BasePositioningProps extends BaseProps {
  constructor() {
    super();

    this._rotationUpdateId =
      this._currentRotationUpdateId =
      this.sinRotationA =
      this.sinRotationB =
      this._x =
      this._y =
      this._rotation =
      this._anchorX =
      this._anchorY =
      this._skewX =
      this._skewY =
        0;

    this.cosRotationA = this.cosRotationB = 1;
  }

  get x() {
    return this._x;
  }
  set x(v) {
    if (this._x !== v) {
      this._x = v;
      ++this.updateId;
    }
  }

  get y() {
    return this._y;
  }
  set y(v) {
    if (this._y !== v) {
      this._y = v;
      ++this.updateId;
    }
  }

  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    if (this._rotation !== v) {
      this._rotation = v;
      ++this._rotationUpdateId;
    }
  }

  get anchorX() {
    return this._anchorX;
  }
  set anchorX(v) {
    if (this._anchorX !== v) {
      this._anchorX = v;
      ++this.updateId;
    }
  }

  get anchorY() {
    return this._anchorY;
  }
  set anchorY(v) {
    if (this._anchorY !== v) {
      this._anchorY = v;
      ++this.updateId;
    }
  }

  get skewX() {
    return this._skewX;
  }
  set skewX(v) {
    if (this._skewX !== v) {
      this._skewX = v;
      ++this._rotationUpdateId;
    }
  }

  get skewY() {
    return this._skewY;
  }
  set skewY(v) {
    if (this._skewY !== v) {
      this._skewY = v;
      ++this._rotationUpdateId;
    }
  }

  updateRotation() {
    if (this._currentRotationUpdateId < this._rotationUpdateId) {
      this._currentRotationUpdateId = this._rotationUpdateId;
      ++this.updateId;

      if (this._skewX === 0 && this._skewY === 0) {
        this.sinRotationA = this.sinRotationB = Math.sin(this._rotation);
        this.cosRotationA = this.cosRotationB = Math.cos(this._rotation);
      } else {
        const rotSkewX = this._rotation - this._skewX;
        const rotSkewY = this._rotation + this._skewY;

        this.sinRotationA = Math.sin(rotSkewY);
        this.cosRotationA = Math.cos(rotSkewY);
        this.sinRotationB = Math.sin(rotSkewX);
        this.cosRotationB = Math.cos(rotSkewX);
      }
    }
  }
}
