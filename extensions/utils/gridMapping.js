/**
 * Converts a coordinate to a vector index
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} w - The width of the grid
 * @returns {number} The vector index
 */
export const coordToVector = (x, y, w) => x + y * w;

/**
 * Converts a vector index to a coordinate
 * @param {number} i - The vector index
 * @param {number} w - The width of the grid
 * @returns {{x: number, y: number}} The coordinate
 */
export const vectorToCoord = (i, w) => ({
  x: i % w,
  y: ~~(i / w),
});
