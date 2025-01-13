import { mix } from "./utils/mix";

export const fadeAudioVolume = (mixer, fileName, min, max, step) =>
  mixer.setVolume(fileName, mix(min, max, step));

export const crossFadeAudioVolumes = (
  mixer,
  fileNameA,
  fileNameB,
  min,
  max,
  step
) => {
  const mixValue = mix(min, max, step);
  mixer.setVolume(fileNameA, mixValue);
  mixer.setVolume(fileNameB, 1 - mixValue);
};

/**
 * AudioMixer class provides methods to manage and manipulate audio playback.
 * It supports loading, playing, stopping, resuming, and setting various audio properties
 * such as volume, pan, pitch, reverb, and filters.
 */
export class AudioMixer {
  /**
   * Creates an instance of AudioMixer.
   * @param {number} [masterVolume=1] - The initial master volume.
   */
  constructor(masterVolume = 1) {
    this.get = this.get.bind(this);
    this._unload = this._unload.bind(this);
    this._play = this._play.bind(this);
    this._stop = this._stop.bind(this);
    this._resume = this._resume.bind(this);

    this._audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    this._audioMap = {};

    this._masterGainNode = this._audioContext.createGain();
    this._masterGainNode.connect(this._audioContext.destination);

    this.masterVolume = masterVolume;
  }

  /**
   * Get/Set the master volume.
   * @returns {number} The current master volume.
   */
  get masterVolume() {
    return this._masterGainNode.gain.value;
  }
  set masterVolume(volume) {
    this._masterGainNode.gain.value = volume;
  }

  /**
   * Gets the state of a specific audio file.
   * @param {string} fileName - The name of the audio file.
   * @returns {Object} The state of the audio file.
   */
  get(fileName) {
    const audioElement = this._audioMap[fileName];
    return audioElement ? { ...audioElement.state } : {};
  }

  /**
   * Gets the state of all loaded audio files.
   * @returns {Object} An object containing the state of all audio files.
   */
  getAll() {
    const result = {};
    this._loopOver((key) => (result[key] = this.get(key)));
    return result;
  }

  /**
   * Loads audio files.
   * @param {Array|Object} files - The audio files to load.
   * @returns {Promise<Array>} A promise that resolves when all files are loaded.
   */
  async load(files) {
    return Promise.all(
      (Array.isArray(files) ? files : [files]).map((file) => this._load(file))
    );
  }

  /**
   * Unloads an audio file.
   * @param {string} fileName - The name of the audio file to unload.
   */
  unload(fileName) {
    this._callFunction(this._unload, fileName);
  }

  /**
   * Plays an audio file.
   * @param {string} fileName - The name of the audio file to play.
   * @param {Object} [options] - Playback options.
   */
  play(fileName, options) {
    this._callFunction(this._play, fileName, options);
  }

  /**
   * Stops an audio file.
   * @param {string} fileName - The name of the audio file to stop.
   */
  stop(fileName) {
    this._callFunction(this._stop, fileName);
  }

  /**
   * Resumes an audio file.
   * @param {string} fileName - The name of the audio file to resume.
   * @param {Object} [options] - Playback options.
   */
  resume(fileName, options) {
    this._callFunction(this._resume, fileName, options);
  }

  /**
   * Sets the loop state of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {boolean} loop - Whether the audio should loop.
   */
  setLoop(fileName, loop) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.loop = loop;
      if (audioElement.state.isPlaying) audioElement.source.loop = loop;
    }
  }

  /**
   * Sets the volume of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {number} volume - The new volume level.
   */
  setVolume(fileName, volume) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.volume = volume;
      if (audioElement.state.isPlaying)
        audioElement.gainNode.gain.value = volume;
    }
  }

  /**
   * Sets the pan of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {number} pan - The new pan value.
   */
  setPan(fileName, pan) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.pan = pan;
      if (audioElement.state.isPlaying) audioElement.panNode.pan.value = pan;
    }
  }

  /**
   * Sets the pitch of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {number} pitch - The new pitch value.
   */
  setPitch(fileName, pitch) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.pitch = pitch;
      if (audioElement.state.isPlaying)
        audioElement.source.playbackRate.value = pitch;
    }
  }

  /**
   * Sets the reverb effect of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {number} delayTime - The delay time for the reverb effect.
   * @param {number} feedbackGain - The feedback gain for the reverb effect.
   */
  setReverb(fileName, delayTime, feedbackGain) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.reverbDelayTime = delayTime;
      audioElement.state.reverbFeedbackGain = feedbackGain;
      if (audioElement.state.isPlaying) {
        audioElement.delayNode.delayTime.value = delayTime;
        audioElement.feedbackGainNode.gain.value = feedbackGain;
      }
    }
  }

  /**
   * Sets the low-pass filter frequency of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {number} frequency - The new low-pass filter frequency.
   */
  setLowPassFilter(fileName, frequency) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.lowPassFilterFrequency = frequency;
      if (audioElement.state.isPlaying)
        audioElement.lowPassNode.frequency.value = frequency;
    }
  }

  /**
   * Sets the high-pass filter frequency of an audio file.
   * @param {string} fileName - The name of the audio file.
   * @param {number} frequency - The new high-pass filter frequency.
   */
  setHighPassFilter(fileName, frequency) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.highPassFilterFrequency = frequency;
      if (audioElement.state.isPlaying)
        audioElement.highPassNode.frequency.value = frequency;
    }
  }

  /**
   * @ignore
   */
  async _load(file) {
    const fileName = file.fileName,
      url = file.url;

    if (!this._audioMap[fileName]) {
      try {
        const response = await fetch(url),
          arrayBuffer = await response.arrayBuffer(),
          buffer = await this._audioContext.decodeAudioData(arrayBuffer);

        this._audioMap[fileName] = {
          buffer: buffer,
          url: url,
          state: {
            loop: false,
            volume: 1,
            pan: 0,
            pitch: 1,
            reverbDelayTime: 0,
            reverbFeedbackGain: 0,
            lowPassFilterFrequency: 22050,
            highPassFilterFrequency: 0,
          },
        };
      } catch (e) {
        return;
      }

      return fileName;
    }
  }

  /**
   * @ignore
   */
  _unload(fileName) {
    this.stop(fileName);
    delete this._audioMap[fileName];
  }

  /**
   * @ignore
   */
  _play(fileName, options = {}) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      this._stop(fileName);

      audioElement.source = this._audioContext.createBufferSource();
      audioElement.gainNode = this._audioContext.createGain();
      audioElement.panNode = this._audioContext.createStereoPanner();
      audioElement.delayNode = this._audioContext.createDelay();
      audioElement.feedbackGainNode = this._audioContext.createGain();
      audioElement.lowPassNode = this._audioContext.createBiquadFilter();
      audioElement.lowPassNode.type = "lowpass";
      audioElement.highPassNode = this._audioContext.createBiquadFilter();
      audioElement.highPassNode.type = "highpass";

      audioElement.source.buffer = audioElement.buffer;

      audioElement.source.connect(audioElement.gainNode);
      audioElement.gainNode.connect(audioElement.panNode);
      audioElement.panNode.connect(audioElement.delayNode);
      audioElement.delayNode.connect(audioElement.feedbackGainNode);
      audioElement.feedbackGainNode.connect(audioElement.delayNode);
      audioElement.delayNode.connect(audioElement.highPassNode);
      audioElement.highPassNode.connect(audioElement.lowPassNode);
      audioElement.lowPassNode.connect(this._masterGainNode);

      audioElement.inited = true;

      this._start(fileName, options.startTime ?? 0);

      this.setVolume(fileName, options.volume ?? 1);
      this.setPan(fileName, options.pan ?? 0);
      this.setPitch(fileName, options.pitch ?? 1);
      this.setLoop(fileName, options.loop ?? false);
      this.setReverb(
        fileName,
        options.reverbDelayTime ?? 0,
        options.reverbFeedbackGain ?? 0
      );
      this.setLowPassFilter(fileName, options.lowPassFilterFrequency ?? 22050);
      this.setHighPassFilter(fileName, options.highPassFilterFrequency ?? 0);
    }
  }

  /**
   * @ignore
   */
  _start(fileName, startTime) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.startTime = this._audioContext.currentTime;
      if (audioElement.inited) {
        audioElement.source.start(this._audioContext.currentTime, startTime);
        audioElement.state.isPlaying = true;
      }
    }
  }

  /**
   * @ignore
   */
  _stop(fileName) {
    const audioElement = this._audioMap[fileName];
    if (audioElement && audioElement.inited) {
      audioElement.state.startTime =
        (this._audioContext.currentTime - audioElement.state.startTime) %
        audioElement.buffer.duration;
      audioElement.source.stop();
      audioElement.source.disconnect();
      audioElement.gainNode.disconnect();
      audioElement.panNode.disconnect();
      if (audioElement.delayNode) {
        audioElement.delayNode.disconnect();
        audioElement.feedbackGainNode.disconnect();
      }
      if (audioElement.lowPassNode) {
        audioElement.lowPassNode.disconnect();
      }
      audioElement.inited = audioElement.state.isPlaying = false;

      delete audioElement.source;
      delete audioElement.gainNode;
      delete audioElement.panNode;
      delete audioElement.delayNode;
      delete audioElement.feedbackGainNode;
      delete audioElement.lowPassNode;
    }
  }

  /**
   * @ignore
   */
  _resume(fileName, options) {
    const audioElement = this._audioMap[fileName];
    audioElement && this._play(fileName, { ...audioElement.state, ...options });
  }

  /**
   * @ignore
   */
  _callFunction(func, fileName, options) {
    fileName ? func(fileName, options) : this._loopOver(func);
  }

  /**
   * @ignore
   */
  _loopOver(callback) {
    Object.keys(this._audioMap).forEach(callback);
  }
}
