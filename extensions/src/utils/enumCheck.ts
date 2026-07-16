/** Checks if a specific bit is set in an enum value. */
export const enumCheck = (value: number, num: number): boolean => (value & num) === num;
