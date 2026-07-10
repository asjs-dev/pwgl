/**
 * Returns a function that always returns the given value
 * @param {*} value - The value to return
 * @returns {function} A function that returns the given value
 */
export const noopReturnsWith = (value) => () => value;
