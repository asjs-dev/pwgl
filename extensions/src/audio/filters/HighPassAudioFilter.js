import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * High-pass audio filter.
 * @extends {BiquadAudioFilter}
 */
export class HighPassAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 0,
      ...config,
      type: "highpass",
    });
  }
}
