/**
 * Clamps a value between a minimum and maximum
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @param {number} value - The value to clamp
 * @returns {number} The clamped value
 */
export const clamp = (min, max, value) => Math.max(min, Math.min(max, value));
