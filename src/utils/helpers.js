/**
 * Remove a specific element from an array
 * @function
 * @param {array} array
 * @param {any} item
 * @ignore
 */
export const removeFromArray = (array, item) => {
  const index = array.indexOf(item);
  index > -1 && array.splice(index, 1);
};

/**
 * Noop function
 * @function
 * @ignore
 */
export const noop = () => {};

/**
 * Fast array filler
 * @function
 * @param {array} target
 * @param {array} source
 * @param {number} from
 * @ignore
 */
export const arraySet = (target, source, from = 0) => {
  let i = source.length;
  while (--i > -1) target[from + i] = source[i];
};
