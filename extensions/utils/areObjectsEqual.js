/**
 * Deeply compares two objects for equality
 * @param {object} a - The first object to compare
 * @param {object} b - The second object to compare
 * @returns {boolean} True if the objects are equal, otherwise false
 */
export const areObjectsEqual = (a, b) => {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (typeof a !== "object" || a === null || b === null) return false;

  const aProps = Object.getOwnPropertyNames(a),
    bProps = Object.getOwnPropertyNames(b);

  if (aProps.length !== bProps.length) return false;

  let propName,
    aPropValue,
    bPropValue,
    subeq,
    i = aProps.length;
  while ((propName = aProps[--i])) {
    aPropValue = a[propName];
    bPropValue = b[propName];

    if (aPropValue !== bPropValue) {
      subeq = false;

      if (typeof aPropValue === "object" && typeof bPropValue === "object")
        subeq = areObjectsEqual(aPropValue, bPropValue);
      if (!subeq) return false;
    }
  }
  return true;
};
