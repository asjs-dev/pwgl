/** Deeply compares two values for equality. */
export const areObjectsEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object" || a === null || b === null) {
    return false;
  }

  const aObject = a as Record<PropertyKey, unknown>;
  const bObject = b as Record<PropertyKey, unknown>;
  const aProps = Reflect.ownKeys(aObject);
  const bProps = Reflect.ownKeys(bObject);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (const propName of aProps) {
    const aPropValue = aObject[propName];
    const bPropValue = bObject[propName];

    if (aPropValue !== bPropValue && !areObjectsEqual(aPropValue, bPropValue)) {
      return false;
    }
  }

  return true;
};
