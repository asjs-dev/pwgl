import "../namespace.js";

AGL.Rect = {
  create : (x, y, width, height) => ({
    x : x || 0,
    y : y || 0,
    width : width || 0,
    height : height || 0
  }),
  toRelativeSize : (rect, width, height) => ({
    x : rect.x / width,
    y : rect.y / height,
    width : rect.width / width,
    height : rect.height / height
  })
};
