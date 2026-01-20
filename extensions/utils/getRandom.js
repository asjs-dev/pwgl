/**
 * Returns a random item from an array
 * @param {Array} items The array to select from
 * @returns {*} A random item from the array
 */
export const getRandom = (items) =>
  items[Math.floor(Math.random() * items.length)];
