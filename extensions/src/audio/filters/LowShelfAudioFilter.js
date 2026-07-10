import { BiquadAudioFilter } from "./BiquadAudioFilter";

/**
 * Low-shelf audio filter.
 * @extends {BiquadAudioFilter}
 */
export class LowShelfAudioFilter extends BiquadAudioFilter {
  constructor(config = {}) {
    super({
      frequency: 320,
      ...config,
      type: "lowshelf",
    });
  }
}
