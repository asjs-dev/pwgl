export const dot = (a, b) => {
  let result = 0;
  for (let i = 0, l = a.length; i < l; i++) result += a[i] * b[i];
  return result;
};
