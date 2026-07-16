/** Remove an item from an array. */
export const removeFromArray = <T>(array: T[], item: T): void => {
  const index = array.indexOf(item);
  index > -1 && array.splice(index, 1);
};
