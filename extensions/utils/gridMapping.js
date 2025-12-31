const coordToVector = (x, y, w) => x + y * w;

const vectorToCoord = (i, w) => ({
  x: i % w,
  y: ~~(i / w),
});

export const gridMapping = {
    coordToVector,
    vectorToCoord,
}