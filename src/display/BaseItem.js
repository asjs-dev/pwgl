import "../namespace.js";

AGL.BaseItem = class {
  constructor() {
    this.matrixCache = AGL.Matrix3.identity();

    this.colorUpdateId =
    this.propsUpdateId = 0;

    this.colorCache = [1, 1, 1, 1];
  }

  destruct() {}
}
