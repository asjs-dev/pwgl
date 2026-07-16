import type { Vector2 } from "./types";

/** Calculates the dot product of two 2D vectors. */
export const dot = (a: Vector2, b: Vector2): number => a.x * b.x + a.y * b.y;
