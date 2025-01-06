export const nthCall = (callback, nth, delay = 0) => {
  let count = nth - (delay + 1);
  return (...args) =>
    !(count = count > -1 ? (1 + count) % nth : ++count) && callback(...args);
};
