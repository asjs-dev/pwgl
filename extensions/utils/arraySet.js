/**
 * Sets values from a source array into a target array starting from a specified index
 * @param {array} target The target array to set values into
 * @param {array} source The source array to get values from
 * @param {number} [from=0] The starting index in the target array
 * @returns {array} The modified target array
 */
export const arraySet = (target, source, from = 0) => {
  let i = source.length;
  while (--i > -1) target[from + i] = source[i];
  return target;
};
