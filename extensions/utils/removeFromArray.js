export const removeFromArray = (array, item) => {
  const index = array.indexOf(item);
  index > -1 && array.splice(index, 1);
};
