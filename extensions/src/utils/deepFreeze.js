/**
 * Recursively freezes a plain object or array.
 * @template T
 * @param {T} value - Value to freeze
 * @returns {Readonly<T>} The frozen value
 */
export const deepFreeze = (value) => {
  const freeze = (item, visited) => {
    if (!item || typeof item !== "object" || visited.has(item)) {
      return item;
    }

    visited.add(item);

    for (const key of Reflect.ownKeys(item)) {
      freeze(item[key], visited);
    }

    return Object.freeze(item);
  };

  return freeze(value, new WeakSet());
};
