/**
 * Call a function every nth call
 * @param {function} callback - The function to call
 * @param {number} nth - The number of calls between each call
 * @param {number} delay - The delay before the first call
 * @returns {function} A function that will call the callback every nth call
 */
export const nthCall = (callback, nth, delay = 0) => {
  let count = nth - (delay + 1);
  return (...args) =>
    !(count = count > -1 ? (1 + count) % nth : ++count) && callback(...args);
};
