/**
 * Mixes two values based on a third value
 * @param {number} a The first value
 * @param {number} b The second value
 * @param {number} c The mixing factor (0 to 1)
 * @returns {number} The mixed value
 */
export const mix = (a, b, c) => c * a + (1 - c) * b;
