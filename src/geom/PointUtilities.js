/**
 * Point
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * Point utilities
 * @typedef {Object} PointUtilities
 * @property {function(number, number):Point} create Create a new Point
 */
export const PointUtilities = {
  /**
   * Create new Point
   * @param {number} x
   * @param {number} y
   * @returns {Point}
   */
  create: (x, y) => ({
    x: x || 0,
    y: y || 0,
  }),
};
