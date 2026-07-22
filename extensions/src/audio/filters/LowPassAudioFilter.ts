// @ts-nocheck
import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * Low-pass audio filter.
 * @extends {BiquadAudioFilter}
 */
export class LowPassAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 22050,
      ...config,
      type: "lowpass",
    });
  }
}
