export const clone = (from) => {
  if (typeof from !== "object" || from === null || from === undefined)
    return from;

  let target = Array.isArray(from) ? [] : {};

  const propNames = Object.getOwnPropertyNames(from);

  let key,
    i = propNames.length;
  while ((key = propNames[--i]))
    target[key] = typeof from[key] === "object" ? clone(from[key]) : from[key];

  return target;
};
