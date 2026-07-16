/** Recursively freezes a plain object or array. */
export const deepFreeze = <T>(value: T): Readonly<T> => {
  const freeze = <Item>(item: Item, visited: WeakSet<object>): Readonly<Item> => {
    if (!item || typeof item !== "object" || visited.has(item)) {
      return item as Readonly<Item>;
    }

    visited.add(item);

    for (const key of Reflect.ownKeys(item)) {
      freeze(item[key as keyof typeof item], visited);
    }

    return Object.freeze(item);
  };

  return freeze(value, new WeakSet());
};
