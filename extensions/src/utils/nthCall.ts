/** Call a function every nth call. */
export const nthCall = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  nth: number,
  delay = 0,
): ((...args: Args) => void) => {
  let count = nth - (delay + 1);

  return (...args) => {
    count = count > -1 ? (1 + count) % nth : ++count;

    if (count === 0) {
      callback(...args);
    }
  };
};
