// @ts-nocheck
import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * Notch audio filter.
 * @extends {BiquadAudioFilter}
 */
export class NotchAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 350,
      ...config,
      type: "notch",
    });
  }
}
