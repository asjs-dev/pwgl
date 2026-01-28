/**
 * Deep clones an object or array
 * @param {object|array} from - The object or array to clone
 * @returns {object|array} The cloned object or array
 */
export const clone = (from) => {
  if (typeof from !== "object" || from === null || from === undefined)
    return from;

  const propNames = Object.getOwnPropertyNames(from);

  let target = Array.isArray(from) ? [] : {},
    key,
    i = propNames.length;
  while ((key = propNames[--i]))
    target[key] = typeof from[key] === "object" ? clone(from[key]) : from[key];

  return target;
};
