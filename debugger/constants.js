/**
 * Show call stacks when formatting snapshots.
 * @constant {number}
 */
export const SHOW_CALL_STACK = 1;

/**
 * Display the original argument values.
 * By default the values are converted to a human-readable format (requires `PWGL.Const`).
 * @constant {number}
 */
export const SHOW_ORIGINAL_VALUES = 2;

/**
 * Show full array arguments when formatting snapshots.
 * By default arrays are displayed in compact form (shortened to `[Type(length)]`).
 * Pass this flag to show the original array contents instead.
 * @constant {number}
 */
export const SHOW_ARRAYS = 4;
