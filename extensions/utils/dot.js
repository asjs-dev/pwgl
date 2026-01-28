/**
 * Calculates the dot product of two 2D vectors
 * @param {object} a - The first vector with x and y properties
 * @param {object} b - The second vector with x and y properties
 * @returns {number} The dot product of the two vectors
 */
export const dot = (a, b) => a.x * b.x + a.y * b.y;
