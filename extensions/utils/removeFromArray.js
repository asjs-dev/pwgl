/**
 * Remove an item from an array
 * @param {*} array
 * @param {*} item
 */
export const removeFromArray = (array, item) => {
  const index = array.indexOf(item);
  index > -1 && array.splice(index, 1);
};
