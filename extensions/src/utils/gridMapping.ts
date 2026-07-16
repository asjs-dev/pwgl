import type { Vector2 } from "./types";

/** Converts a coordinate to a vector index. */
export const coordToVector = (x: number, y: number, w: number): number => x + y * w;

/** Converts a vector index to a coordinate. */
export const vectorToCoord = (i: number, w: number): Vector2 => ({
  x: i % w,
  y: ~~(i / w),
});
