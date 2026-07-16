/** Returns a function that always returns the given value. */
export const noopReturnsWith = <T>(value: T): (() => T) => () => value;
