/**
 * Checks if a specific bit is set in an enum value
 * @param {number} value The enum value
 * @param {number} num The bit to check
 * @returns {boolean} True if the bit is set, false otherwise
 */
export const enumCheck = (value, num) => (value & num) === num;
