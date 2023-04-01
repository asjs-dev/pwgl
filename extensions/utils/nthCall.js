export const nthCall = (callback, nth, dly = 0) => {
  let count = nth - (dly + 1);
  return (...args) =>
    (count = count > -1 ? (1 + count) % nth : ++count) === 0 &&
    callback(...args);
};
