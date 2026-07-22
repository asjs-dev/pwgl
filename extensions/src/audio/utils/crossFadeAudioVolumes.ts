// @ts-nocheck
import { mix } from "../../utils/mix";

/**
 * Crossfades the volume between two audio items based on step
 * @param {AudioItem} audioItemA - The first audio item
 * @param {AudioItem} audioItemB - The second audio item
 * @param {number} min - The minimum volume for the first audio item
 * @param {number} max - The maximum volume for the first audio item
 * @param {number} step - The step value (0 to 1)
 */
export const crossFadeAudioVolumes = (audioItemA, audioItemB, min, max, step) => {
  const mixValue = mix(min, max, step);
  audioItemA.volume = mixValue;
  audioItemB.volume = 1 - mixValue;
};
