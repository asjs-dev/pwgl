// @ts-nocheck
import { normalizeAudioValue } from "./internal/normalizeAudioValue";

/**
 * The BaseAudio class provides methods and properties to control audio playback,
 * including volume, panning, reverb, and filtering effects. It manages the creation,
 * connection, and disconnection of audio nodes in a Web Audio API context.
 */
export class BaseAudio {
  constructor() {
    this._volume = 1;
    this._muted = false;
    this._pan = 0;
    this._reverbDelayTime = 0;
    this._reverbFeedbackGain = 0;
    this.filters = [];
  }

  /**
   * Gets the volume.
   * @returns {number} The current volume.
   */
  get volume() {
    return this._volume;
  }
  set volume(volume) {
    this._volume = normalizeAudioValue(volume, 1, 0);
    this.$updateGain();
  }

  /**
   * Gets muted state.
   * @returns {boolean} Whether the audio output is muted.
   */
  get muted() {
    return this._muted;
  }
  set muted(muted) {
    this._muted = muted;
    this.$updateGain();
  }

  /**
   * Gets the ordered audio filter list.
   * @returns {Array<Object>} The current filter list.
   */
  get filters() {
    return this._filters;
  }
  set filters(filters) {
    const currentFilters = this._filters;

    if (this.$nodesConnected && this.$filterInputNode) {
      this.$filterInputNode.disconnect();
      currentFilters?.forEach((filter) => filter?.disconnect?.());
    }

    currentFilters?.forEach((filter) => filter?.$setOnChange?.(null));

    this._filters = new Proxy(filters ?? [], {
      deleteProperty: (target, property) => {
        target[property]?.$setOnChange?.(null);
        delete target[property];
        this.$reconnectFilterChain();
        return true;
      },
      set: (target, property, value) => {
        target[property]?.$setOnChange?.(null);
        target[property] = value;
        value?.$setOnChange?.(() => this.$reconnectFilterChain());
        this.$reconnectFilterChain();
        return true;
      },
    });

    this._filters.forEach((filter) => filter?.$setOnChange?.(() => this.$reconnectFilterChain()));

    this.$reconnectFilterChain();
  }

  /**
   * Gets the value of the pan property.
   * @returns {number} The current value of the pan.
   */
  get pan() {
    return this._pan;
  }
  set pan(pan) {
    this._pan = normalizeAudioValue(pan, 0, -1, 1);
    if (this.$nodesConnected) {
      this.$panNode.pan.value = this._pan;
    }
  }

  /**
   * Gets the reverb delay time.
   * @returns {number} The current reverb delay time.
   */
  get reverbDelayTime() {
    return this._reverbDelayTime;
  }
  set reverbDelayTime(delayTime) {
    this._reverbDelayTime = normalizeAudioValue(delayTime, 0, 0);
    if (this.$nodesConnected) {
      this.$delayNode.delayTime.value = this._reverbDelayTime;
    }
  }

  /**
   * Gets the reverb feedback gain value.
   * @returns {number} The current reverb feedback gain.
   */
  get reverbFeedbackGain() {
    return this._reverbFeedbackGain;
  }
  set reverbFeedbackGain(feedbackGain) {
    this._reverbFeedbackGain = normalizeAudioValue(feedbackGain, 0, 0);
    if (this.$nodesConnected) {
      this.$feedbackGainNode.gain.value = this._reverbFeedbackGain;
    }
  }

  /**
   * @ignore
   */
  $createNodes(context) {
    if (context) {
      this.$context = context;
      this.$gainNode = context.createGain();
      this.$panNode = context.createStereoPanner();
      this.$delayNode = context.createDelay();
      this.$feedbackGainNode = context.createGain();

      this.$nodesCreated = true;
      this.$updateGain();
    }
  }

  /**
   * @ignore
   */
  $connectNodes(destination) {
    if (destination && this.$nodesCreated) {
      this.$destinationNode = destination;
      this.$gainNode.connect(this.$panNode);
      this.$panNode.connect(this.$delayNode);
      this.$delayNode.connect(this.$feedbackGainNode);
      this.$feedbackGainNode.connect(this.$delayNode);
      this.$filterInputNode = this.$delayNode;
      this.$connectFilterChain(this.$filterInputNode, destination);

      this.$nodesConnected = true;
    }
  }

  /**
   * @ignore
   */
  $connectFilterChain(inputNode, destination) {
    if (inputNode && destination) {
      let previousNode = inputNode;

      this._filters.forEach((filter) => {
        if (filter && filter.on !== false) {
          if (filter.$context !== this.$context) {
            filter.destruct?.();
            filter.$context = this.$context;
          }

          if (!filter.input || !filter.output) {
            filter.createNodes(this.$context);
          }

          filter.updateNodes?.();

          if (filter.input && filter.output) {
            previousNode.connect(filter.input);
            previousNode = filter.output;
          }
        }
      });

      previousNode.connect(destination);
    }
  }

  /**
   * @ignore
   */
  $disconnectFilterChain() {
    this._filters.forEach((filter) => filter?.disconnect?.());
  }

  /**
   * @ignore
   */
  $reconnectFilterChain() {
    if (this.$nodesConnected && this.$filterInputNode && this.$destinationNode) {
      this.$filterInputNode.disconnect();
      this.$disconnectFilterChain();
      this.$connectFilterChain(this.$filterInputNode, this.$destinationNode);
    }
  }

  /**
   * @ignore
   */
  $disconnectNodes() {
    if (this.$nodesConnected) {
      this.$disconnectFilterChain();
      this.$gainNode.disconnect();
      this.$panNode.disconnect();
      this.$delayNode.disconnect();
      this.$feedbackGainNode.disconnect();

      this.$gainNode = this.$panNode = this.$delayNode = this.$feedbackGainNode = this.$filterInputNode = this.$destinationNode = null;

      this.$nodesConnected = this.$nodesCreated = false;
    }
  }

  /**
   * @ignore
   */
  $setConfig(config) {
    if (config.filters && config.filters !== this._filters) {
      this.filters = config.filters;
    }

    this.volume = config.volume ?? 1;
    this.muted = config.muted ?? false;
    this.pan = config.pan ?? 0;
    this.reverbDelayTime = config.reverbDelayTime ?? 0;
    this.reverbFeedbackGain = config.reverbFeedbackGain ?? 0;
  }

  /**
   * @ignore
   */
  $updateGain() {
    if (this.$gainNode) {
      this.$gainNode.gain.value = this._muted ? 0 : this._volume;
    }
  }
}
