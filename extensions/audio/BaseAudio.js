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
    this._lowPassFilterFrequency = 22050;
    this._lowPassFilterQ = 1;
    this._highPassFilterFrequency = 0;
    this._highPassFilterQ = 1;
  }

  /**
   * Gets the volume.
   * @returns {number} The current volume.
   */
  get volume() {
    return this._volume;
  }
  set volume(volume) {
    this._volume = volume;
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
   * Gets the value of the pan property.
   * @returns {number} The current value of the pan.
   */
  get pan() {
    return this._pan;
  }
  set pan(pan) {
    this._pan = pan;
    if (this.$nodesConnected) {
      this.$panNode.pan.value = pan;
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
    this._reverbDelayTime = delayTime;
    if (this.$nodesConnected) {
      this.$delayNode.delayTime.value = delayTime;
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
    this._reverbFeedbackGain = feedbackGain;
    if (this.$nodesConnected) {
      this.$feedbackGainNode.gain.value = feedbackGain;
    }
  }

  /**
   * Gets the frequency of the low-pass filter.
   * @returns {number} The current low-pass filter frequency.
   */
  get lowPassFilterFrequency() {
    return this._lowPassFilterFrequency;
  }
  set lowPassFilterFrequency(frequency) {
    this._lowPassFilterFrequency = frequency;
    if (this.$nodesConnected) {
      this.$lowPassNode.frequency.value = frequency;
    }
  }

  /**
   * Gets the Q value of the low-pass filter.
   * @returns {number} The current low-pass filter Q value.
   */
  get lowPassFilterQ() {
    return this._lowPassFilterQ;
  }
  set lowPassFilterQ(q) {
    this._lowPassFilterQ = q;
    if (this.$nodesConnected) {
      this.$lowPassNode.Q.value = q;
    }
  }

  /**
   * Gets the frequency of the high-pass filter.
   * @returns {number} The current high-pass filter frequency.
   */
  get highPassFilterFrequency() {
    return this._highPassFilterFrequency;
  }
  set highPassFilterFrequency(frequency) {
    this._highPassFilterFrequency = frequency;
    if (this.$nodesConnected) {
      this.$highPassNode.frequency.value = frequency;
    }
  }

  /**
   * Gets the Q value of the high-pass filter.
   * @returns {number} The current high-pass filter Q value.
   */
  get highPassFilterQ() {
    return this._highPassFilterQ;
  }
  set highPassFilterQ(q) {
    this._highPassFilterQ = q;
    if (this.$nodesConnected) {
      this.$highPassNode.Q.value = q;
    }
  }

  /**
   * @ignore
   */
  $createNodes(context) {
    if (context) {
      this.$gainNode = context.createGain();
      this.$panNode = context.createStereoPanner();
      this.$delayNode = context.createDelay();
      this.$feedbackGainNode = context.createGain();
      this.$lowPassNode = context.createBiquadFilter();
      this.$lowPassNode.type = "lowpass";
      this.$highPassNode = context.createBiquadFilter();
      this.$highPassNode.type = "highpass";

      this.$nodesCreated = true;
      this.$updateGain();
    }
  }

  /**
   * @ignore
   */
  $connectNodes(destination) {
    if (destination && this.$nodesCreated) {
      this.$gainNode.connect(this.$panNode);
      this.$panNode.connect(this.$delayNode);
      this.$delayNode.connect(this.$feedbackGainNode);
      this.$feedbackGainNode.connect(this.$delayNode);
      this.$delayNode.connect(this.$highPassNode);
      this.$highPassNode.connect(this.$lowPassNode);
      this.$lowPassNode.connect(destination);

      this.$nodesConnected = true;
    }
  }

  /**
   * @ignore
   */
  $disconnectNodes() {
    if (this.$nodesConnected) {
      this.$gainNode.disconnect();
      this.$panNode.disconnect();
      this.$delayNode.disconnect();
      this.$feedbackGainNode.disconnect();
      this.$lowPassNode.disconnect();

      this.$gainNode = this.$panNode = this.$delayNode = this.$feedbackGainNode = this.$lowPassNode = null;

      this.$nodesConnected = this.$nodesCreated = false;
    }
  }

  /**
   * @ignore
   */
  $setConfig(config) {
    this.volume = config.volume ?? 1;
    this.muted = config.muted ?? false;
    this.pan = config.pan ?? 0;
    this.reverbDelayTime = config.reverbDelayTime ?? 0;
    this.reverbFeedbackGain = config.reverbFeedbackGain ?? 0;
    this.lowPassFilterFrequency = config.lowPassFilterFrequency ?? 22050;
    this.lowPassFilterQ = config.lowPassFilterQ ?? 1;
    this.highPassFilterFrequency = config.highPassFilterFrequency ?? 0;
    this.highPassFilterQ = config.highPassFilterQ ?? 1;
  }

  /**
   * @ignore
   */
  $updateGain() {
    if (this.$gainNode) {
      this.$gainNode.gain.value = this._muted ? 0 : Number.isFinite(this._volume) ? this._volume : 1;
    }
  }
}
