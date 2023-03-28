import { Matrix3Utilities } from "../geom/Matrix3Utilities";

/**
 * Base Item
 */
export class BaseItem {
  /**
   * Creates an instance of BaseItem.
   * @constructor
   */
  constructor() {
    this.matrixCache = Matrix3Utilities.identity();
    this.colorUpdateId = this.propsUpdateId = 0;
    this.colorCache = [1, 1, 1, 1];
  }

  /**
   * Destruct class
   */
  destruct() {}
}
