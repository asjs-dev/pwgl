/**
 * Tone map type
 * @member
 * @property {number} REINHARD output color = color / (1 + color)
 * @property {number} ACES output color = ACES filmic curve (Narkowicz fit), clamped to 0-1
 */
export const ToneMapType = {
  REINHARD: 0,
  ACES: 1,
};
