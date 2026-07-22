// @ts-nocheck
import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * High-shelf audio filter.
 * @extends {BiquadAudioFilter}
 */
export class HighShelfAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 3200,
      ...config,
      type: "highshelf",
    });
  }
}
