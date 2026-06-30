import { BaseAudioFilter } from "./BaseAudioFilter";
import { normalizeAudioValue } from "../internal/normalizeAudioValue";

/**
 * Base class for BiquadFilterNode based audio filters.
 * @extends {BaseAudioFilter}
 */
export class BiquadAudioFilter extends BaseAudioFilter {
  /**
   * @param {Object} [config={}] - Filter configuration.
   * @param {string} [config.type="lowpass"] - Biquad filter type.
   * @param {number} [config.frequency=350] - Filter frequency.
   * @param {number} [config.Q=1] - Filter Q value.
   * @param {number} [config.gain=0] - Filter gain value.
   */
  constructor(config = {}) {
    super(config);

    this._type = config.type ?? "lowpass";
    this._frequency = normalizeAudioValue(config.frequency, 350, 0);
    this._Q = normalizeAudioValue(config.Q, 1, 0);
    this._gain = normalizeAudioValue(config.gain, 0);
  }

  get type() {
    return this._type;
  }
  set type(type) {
    this._type = type;
    this.updateNodes();
  }

  get frequency() {
    return this._frequency;
  }
  set frequency(frequency) {
    this._frequency = normalizeAudioValue(frequency, 350, 0);
    this.updateNodes();
  }

  get Q() {
    return this._Q;
  }
  set Q(q) {
    this._Q = normalizeAudioValue(q, 1, 0);
    this.updateNodes();
  }

  get gain() {
    return this._gain;
  }
  set gain(gain) {
    this._gain = normalizeAudioValue(gain, 0);
    this.updateNodes();
  }

  /**
   * @inheritdoc
   */
  createNodes(context) {
    if (context) {
      this.input = this.output = context.createBiquadFilter();
      this.updateNodes();
    }
  }

  /**
   * @inheritdoc
   */
  updateNodes() {
    if (this.input) {
      this.input.type = this.type;
      this.input.frequency.value = this.frequency;
      this.input.Q.value = this.Q;
      this.input.gain.value = this.gain;
    }
  }
}
