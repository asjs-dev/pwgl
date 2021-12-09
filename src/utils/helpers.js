export const removeFromArray = (array, item) => {
  const index = array.indexOf(item);
  index > -1 && array.splice(index, 1);
}

export const emptyFunction = () => {};

export const arraySet = (target, source, from) => {
  let i = source.length;
  while (--i > -1) target[from + i] = source[i];
}
