/**
 * Deeply compares two objects for equality
 * @param {object} a - The first object to compare
 * @param {object} b - The second object to compare
 * @returns {boolean} True if the objects are equal, otherwise false
 */
export const areObjectsEqual = (a, b) => {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object" || a === null || b === null) {
    return false;
  }

  const aProps = Reflect.ownKeys(a);
  const bProps = Reflect.ownKeys(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (const propName of aProps) {
    const aPropValue = a[propName];
    const bPropValue = b[propName];

    if (aPropValue !== bPropValue) {
      let subeq = false;

      if (typeof aPropValue === "object" && typeof bPropValue === "object") {
        subeq = areObjectsEqual(aPropValue, bPropValue);
      }

      if (!subeq) {
        return false;
      }
    }
  }

  return true;
};
