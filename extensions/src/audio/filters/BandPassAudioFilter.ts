// @ts-nocheck
import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * Band-pass audio filter.
 * @extends {BiquadAudioFilter}
 */
export class BandPassAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 350,
      ...config,
      type: "bandpass",
    });
  }
}
