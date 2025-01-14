import { BaseAudio } from "./BaseAudio";

/**
 * Represents an audio item that can be loaded, played, and manipulated.
 * Extends the BaseAudio class to provide additional functionality for handling audio data.
 */
export class AudioItem extends BaseAudio {
  /**
   * Creates an instance of AudioItem.
   *
   * @param {string|null} [url=null] - The URL of the audio file to load.
   * @param {Object} [options={}] - Configuration options for the audio item.
   */
  constructor(url = null, options = {}) {
    super();

    this.$setOptions(options);
    this.load(url);
  }

  /**
   * Gets the loop property.
   * @returns {boolean} The current value of the loop property.
   */
  get loop() {
    return this._loop;
  }
  set loop(loop) {
    this._loop = loop;
    if (this.$nodesConnected) this._source.loop = loop;
  }

  /**
   * Gets the pitch value.
   * @returns {number} The current pitch value.
   */
  get pitch() {
    return this._pitch;
  }
  set pitch(pitch) {
    this._pitch = pitch;
    if (this.$nodesConnected) this._source.playbackRate.value = pitch;
  }

  /**
   * Asynchronously loads audio data from the provided URL.
   *
   * @param {string} url - The URL of the audio resource to load.
   * @returns {Promise<void>} A promise that resolves when the audio data is loaded.
   */
  async load(url) {
    if (url) {
      this.url = url;
      this._audioResponse = await fetch(url);
      this._update();
    }
  }

  /**
   * Unloads the current instance by disconnecting and clearing the buffer.
   */
  unload() {
    this.disconnect();
    this._buffer = null;
  }

  /**
   * Connects the current instance to the provided audio mixer.
   * If already connected to a different audio mixer, it will first disconnect from the current one.
   *
   * @param {Object} audioMixer - The audio mixer to connect to.
   */
  connect(audioMixer) {
    if (this._audioMixer !== audioMixer) {
      this.disconnect();
      this._audioMixer = audioMixer;
      this._update();
      this._audioMixer.connect(this);
    }
  }

  /**
   * Disconnects the current instance from the audio mixer.
   * If an audio mixer is connected, it stops the audio and disconnects the instance from the mixer.
   */
  disconnect() {
    if (this._audioMixer) {
      this.stop();
      this._audioMixer.disconnect(this);
      this._audioMixer = null;
    }
  }

  /**
   * Starts playing the audio from a specified time.
   *
   * @param {number} [from=0] - The time in seconds from which to start playing the audio.
   */
  play(from = 0) {
    this.stop();

    this.isPlaying = true;

    const context = this._audioMixer.context;

    this.$createNodes(context);
    this.$connectNodes(this._audioMixer.node);

    if (context) {
      this._startTime = context.currentTime;
      try {
        this.$nodesConnected && this._source.start(context.currentTime, from);
      } catch (e) {}
    }

    this.$setOptions(this);
  }

  /**
   * Stops the audio playback and updates the start time based on the current playback position.
   * If an audio mixer and buffer are present, the start time is recalculated to allow resuming from the same position.
   */
  stop() {
    this.isPlaying = false;

    if (this._audioMixer && this._buffer)
      this._startTime =
        (this._audioMixer.context.currentTime - this._startTime) %
        this._buffer.duration;

    this.$disconnectNodes();
  }

  /**
   * Resumes playback from the specified start time.
   */
  resume() {
    this.play(this._startTime);
  }

  /**
   * @ignore
   */
  $createNodes(context) {
    if (context && this._buffer) {
      this._source = context.createBufferSource();
      this._source.buffer = this._buffer;
      super.$createNodes(context);
    }
  }

  /**
   * @ignore
   */
  $connectNodes(destination) {
    if (destination && this.$nodesCreated) {
      this._source.connect(this.$gainNode);
      super.$connectNodes(destination);
    }
  }

  /**
   * @ignore
   */
  $disconnectNodes() {
    if (this.$nodesConnected) {
      this._source.stop();
      this._source.disconnect();
      this._source = null;
      super.$disconnectNodes();
    }
  }

  /**
   * @ignore
   */
  $setOptions(options = {}) {
    this.loop = options.loop ?? false;
    this.pitch = options.pitch ?? 1;
    super.$setOptions(options);
  }

  /**
   * @ignore
   */
  async _update() {
    if (this._audioResponse && this._audioMixer) {
      const arrayBuffer = await this._audioResponse.arrayBuffer();
      this._buffer = await this._audioMixer.context.decodeAudioData(
        arrayBuffer
      );
      this.isPlaying && this.play();
    }
  }
}
