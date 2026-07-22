/** Call a function every nth call. */
export const nthCall = <Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
  nth: number,
  delay = 0,
): ((...args: Args) => Result | false) => {
  let count = nth - (delay + 1);

  return (...args) => !(count = count > -1 ? (1 + count) % nth : ++count) && callback(...args);
};
