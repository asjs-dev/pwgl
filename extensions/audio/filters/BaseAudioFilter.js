/**
 * Base class for audio filters that can be chained by BaseAudio.
 */
export class BaseAudioFilter {
  /**
   * @param {Object} [config={}] - Filter configuration.
   * @param {boolean} [config.on=true] - Whether the filter is active in the chain.
   */
  constructor(config = {}) {
    this._onChange = null;
    this._on = config.on ?? true;
    this.input = null;
    this.output = null;
  }

  get on() {
    return this._on;
  }
  set on(on) {
    this._on = on;
    this._onChange?.(this);
  }

  /**
   * @ignore
   */
  $setOnChange(onChange) {
    this._onChange = onChange;
  }

  /**
   * Creates the filter nodes for the provided audio context.
   *
   * @param {BaseAudioContext} context - The Web Audio context.
   */
  createNodes(context) {
    if (context) {
      this.input = this.output = context.createGain();
    }
  }

  /**
   * Applies the current filter settings to created nodes.
   */
  updateNodes() {}

  /**
   * Disconnects the filter output from the current graph without clearing settings.
   */
  disconnect() {
    this.output?.disconnect();
  }

  /**
   * Disconnects and clears created nodes.
   */
  destruct() {
    this.disconnect();
    this.input = this.output = null;
  }
}
