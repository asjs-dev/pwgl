// @ts-nocheck
import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * Peaking audio filter.
 * @extends {BiquadAudioFilter}
 */
export class PeakingAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 1000,
      ...config,
      type: "peaking",
    });
  }
}
