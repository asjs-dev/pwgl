/**
 * Rectangle
 * @typedef {Object} Rectangle
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * Rectngle utilities
 * @typedef {Object} RectangleUtilities
 * @property {function(number, number, number, number):Rectangle} create Creates a new Rectangle
 * @property {function(Rectangle, number, number):Rectangle} toRelativeSize Calculate the relative size of the rectangle based on width and height
 */
export const RectangleUtilities = {
  /**
   * Create new Rectangle
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @returns {Rect}
   */
  create: (x, y, width, height) => ({
    x: x || 0,
    y: y || 0,
    width: width || 0,
    height: height || 0,
  }),
  /**
   * Calculate the relative size of the rectangle based on width and height
   * @param {Rect} rect
   * @param {number} width
   * @param {number} height
   * @returns {Rect}
   */
  toRelativeSize: (rect, width, height) => ({
    x: rect.x / width,
    y: rect.y / height,
    width: rect.width / width,
    height: rect.height / height,
  }),
};
