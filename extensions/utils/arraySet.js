export const arraySet = (target, source, from = 0) => {
  let i = source.length;
  while (--i > -1) target[from + i] = source[i];
  return target;
};
