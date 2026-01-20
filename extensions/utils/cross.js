/**
+ * Calculates the cross product of two 2D vectors
+ * @param {object} a The first vector with x and y properties
+ * @param {object} b The second vector with x and y properties
+ * @returns {number} The cross product of the two vectors
+ */
export const cross = (a, b) => a.x * b.y - a.y * b.x;
