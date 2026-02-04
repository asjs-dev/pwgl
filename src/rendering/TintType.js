/**
 * Tint type
 * @member
 * @property {number} NONE output color = source color * 1 + tint color * 0
 * @property {number} MULTIPLY output color = source color * tint color
 * @property {number} GRAYSCALE output color = if source color red channel == source color green channel and source color red channel == source color blue channel then source color * tint color else source color
 * @property {number} OVERRIDE output color = tint color
 * @property {number} ADD output color = source color + tint color
 */
export const TintType = {
  NONE: 0,
  MULTIPLY: 1,
  GRAYSCALE: 2,
  OVERRIDE: 3,
  ADD: 4,
};
