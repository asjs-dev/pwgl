/**
 * Formatting flags (bitmask).
 * These control how recorded snapshots are rendered in the console output.
 */

/**
 * Include captured JavaScript call stacks for each logged WebGL call.
 * Useful to trace where a call originated from.
 * @constant {number}
 */
export const SHOW_CALL_STACKS = 1;

/**
 * Display original argument values instead of converting them
 * to human-readable WebGL constant names.
 * @constant {number}
 */
export const SHOW_ORIGINAL_VALUES = 2;

/**
 * Display full array contents (e.g. TypedArrays) when formatting snapshots.
 * By default arrays are compacted to a short form: `[Type(length)]`.
 * @constant {number}
 */
export const SHOW_ARRAYS = 4;