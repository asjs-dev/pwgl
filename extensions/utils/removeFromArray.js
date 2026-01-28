/**
 * Remove an item from an array
 * @param {*} array - The array to remove the item from
 * @param {*} item - The item to remove
 */
export const removeFromArray = (array, item) => {
  const index = array.indexOf(item);
  index > -1 && array.splice(index, 1);
};
