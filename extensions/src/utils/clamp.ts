/** Clamps a value between a minimum and maximum. */
export const clamp = (min: number, max: number, value: number): number => Math.max(min, Math.min(max, value));
