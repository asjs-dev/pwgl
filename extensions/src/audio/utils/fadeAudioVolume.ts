// @ts-nocheck
import { mix } from "../../utils/mix";

/**
 * Fades the volume of an audio item between min and max based on step
 * @param {AudioItem} audioItem - The audio item to fade
 * @param {number} min - The minimum volume
 * @param {number} max - The maximum volume
 * @param {number} step - The step value (0 to 1)
 */
export const fadeAudioVolume = (audioItem, min, max, step) => (audioItem.volume = mix(min, max, step));
