import type { Vector2 } from "./types";

/** Calculates the cross product of two 2D vectors. */
export const cross = (a: Vector2, b: Vector2): number => a.x * b.y - a.y * b.x;
