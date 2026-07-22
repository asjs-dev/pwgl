let id = -1;

/**
 * Returns an incrementing identifier for the current runtime.
 * The first call returns `0`. After reaching JavaScript's largest safe integer,
 * `9_007_199_254_740_991`, the counter wraps back to `0`.
 */
export const getUniqueId = (): number =>
  (id = id === Number.MAX_SAFE_INTEGER ? 0 : id + 1);
