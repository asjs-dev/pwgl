import { Matrix3 } from "../geom/Matrix3.js";

export class BaseItem {
  constructor() {
    this.matrixCache = Matrix3.identity();
    this.colorUpdateId = this.propsUpdateId = 0;
    this.colorCache = [1, 1, 1, 1];
  }

  destruct() {}
}
