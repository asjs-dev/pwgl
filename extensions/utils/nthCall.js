/**
 * Call a function every nth call
 * @param {function} callback 
 * @param {number} nth 
 * @param {number} delay 
 * @returns {function} A function that will call the callback every nth call
 */
export const nthCall = (callback, nth, delay = 0) => {
  let count = nth - (delay + 1);
  return (...args) =>
    !(count = count > -1 ? (1 + count) % nth : ++count) && callback(...args);
};
