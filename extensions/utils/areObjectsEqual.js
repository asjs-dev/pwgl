export const areObjectsEqual = (a, b) => {
  if (typeof a !== typeof b) return false;

  if (typeof a !== "object") return a === b;

  const ap = Object.getOwnPropertyNames(a);
  const bp = Object.getOwnPropertyNames(b);

  if (ap.length !== bp.length) return false;

  let pn, av, bv, subeq;
  let i = ap.length;
  while ((pn = ap[--i])) {
    av = a[pn];
    bv = b[pn];

    if (av !== bv) {
      subeq = false;

      if (typeof av === "object" && typeof bv === "object")
        subeq = areObjectsEqual(av, bv);

      if (!subeq) return false;
    }
  }
  return true;
};
