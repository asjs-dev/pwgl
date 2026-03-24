import { Matrix3Utilities } from "../math/Matrix3Utilities";
import "../math/PointType";
import "../math/RectangleType";
import { Item } from "./Item";

/**
 * Base drawable class
 * @extends {Item}
 */
export class BaseDrawable extends Item {
  /**
   * Creates an instance of BaseDrawable.
   * @constructor
   */
  constructor() {
    super();

    this.$corners = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  }

  /**
   * Returns with bounds
   * @returns {Rectangle}
   */
  getBounds() {
    this.$calcCorners();

    const { $corners, $bounds } = this;
    const a = $corners[0];
    const b = $corners[1];
    const c = $corners[2];
    const d = $corners[3];

    $bounds.x = Math.min(a.x, b.x, c.x, d.x);
    $bounds.y = Math.min(a.y, b.y, c.y, d.y);
    $bounds.width = Math.max(a.x, b.x, c.x, d.x);
    $bounds.height = Math.max(a.y, b.y, c.y, d.y);

    return $bounds;
  }

  /**
   * @ignore
   */
  $calcCorners() {
    this.stage && Matrix3Utilities.calcCorners(this.$corners, this.matrixCache, this.stage.renderer);
  }
}
