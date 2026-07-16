/** Returns a random item from an array. */
export const getRandomFrom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
