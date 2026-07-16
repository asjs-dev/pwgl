/** Sets values from a source array into a target array starting from a specified index. */
export const arraySet = <T, U extends T>(target: T[], source: U[], from = 0): T[] => {
  let i = source.length;
  while (--i > -1) {
    target[from + i] = source[i];
  }
  return target;
};
