import { BaseAudio } from "./BaseAudio";
import { normalizeAudioValue } from "./internal/normalizeAudioValue";

/**
 * Represents an audio item that can be loaded, played, and manipulated.
 * Extends the BaseAudio class to provide additional functionality for handling audio data.
 */
export class AudioItem extends BaseAudio {
  /**
   * Creates an instance of AudioItem.
   *
   * @param {string|null} [url=null] - The URL of the audio file to load.
   * @param {Object} [config={}] - Configuration for the audio item.
   */
  constructor(url = null, config = {}) {
    super();

    this.seek = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.$setConfig(config);
    this.load(url);
  }

  /**
   * Gets the audio duration in seconds.
   * @returns {number} The decoded audio duration.
   */
  get duration() {
    return this._buffer?.duration ?? 0;
  }

  /**
   * Gets the current playback position in seconds.
   * @returns {number} The current playback position.
   */
  get currentTime() {
    return this.isPlaying ? this._getCurrentSeek() : this.seek;
  }

  /**
   * Gets the seek position in seconds.
   * @returns {number} The seek position.
   */
  get seek() {
    return this._seek;
  }
  set seek(seek) {
    const wasPlaying = this.isPlaying;
    this._seek = this._normalizeSeek(seek);

    if (wasPlaying) {
      this.play(this._seek);
    }
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
    if (this.$nodesConnected) {
      this._source.loop = loop;
    }
  }

  /**
   * Gets the pitch value.
   * @returns {number} The current pitch value.
   */
  get pitch() {
    return this._pitch;
  }
  set pitch(pitch) {
    this._pitch = normalizeAudioValue(pitch, 1, 0);
    if (this.$nodesConnected) {
      this._source.playbackRate.value = this._pitch;
    }
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
      audioMixer.connect(this);
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
   * Starts playing the audio from the current seek position or a specified time.
   *
   * @param {number} [from=this.seek] - The time in seconds from which to start playing the audio.
   */
  play(from = this.seek) {
    this.$disconnectNodes();

    this._seek = this._normalizeSeek(from);
    this.isPlaying = true;
    this.isPaused = false;

    const { _audioMixer } = this;
    const { context } = _audioMixer;

    this.$createNodes(context);
    this.$connectNodes(_audioMixer.node);

    if (context) {
      this._startTime = context.currentTime;
      try {
        this.$nodesConnected && this._source.start(context.currentTime, this._seek);
      } catch {}
    }

    this.$setConfig(this);
  }

  /**
   * Pauses the audio playback and stores the current seek position.
   */
  pause() {
    if (this.isPlaying) {
      this._seek = this.currentTime;
      this.isPlaying = false;
      this.isPaused = true;
      this.$disconnectNodes();
    }
  }

  /**
   * Stops the audio playback and resets the seek position.
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.seek = 0;
    this.$disconnectNodes();
  }

  /**
   * @ignore
   */
  _getCurrentSeek() {
    const { _audioMixer, _buffer, _seek, _startTime } = this;

    if (!_audioMixer || !_buffer || typeof _startTime !== "number") {
      return _seek;
    }

    return (_audioMixer.context.currentTime - _startTime + _seek) % _buffer.duration;
  }

  /**
   * @ignore
   */
  _normalizeSeek(seek) {
    const value = Number.isFinite(seek) ? seek : 0;
    const duration = this.duration;

    return Math.max(0, duration ? Math.min(duration, value) : value);
  }

  /**
   * @ignore
   */
  $createNodes(context) {
    const { _buffer } = this;

    if (context && _buffer) {
      this._source = context.createBufferSource();
      this._source.buffer = _buffer;
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
  $setConfig(config = {}) {
    this.loop = config.loop ?? false;
    this.pitch = config.pitch ?? 1;
    super.$setConfig(config);
  }

  /**
   * @ignore
   */
  async _update() {
    const { _audioResponse, _audioMixer } = this;

    if (_audioResponse && _audioMixer) {
      const arrayBuffer = await _audioResponse.arrayBuffer();
      this._buffer = await _audioMixer.context.decodeAudioData(arrayBuffer);
      this.isPlaying && this.play();
    }
  }
}
