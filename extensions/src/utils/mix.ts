/** Mixes two values based on a third value. */
export const mix = (a: number, b: number, c: number): number => c * a + (1 - c) * b;
