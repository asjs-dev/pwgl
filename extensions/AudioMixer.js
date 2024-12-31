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

export class AudioMixer {
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

    this.setMasterVolume(masterVolume);
  }

  get(fileName) {
    const audioElement = this._audioMap[fileName];
    return audioElement ? { ...audioElement.state } : {};
  }

  getAll() {
    const result = {};
    this._loopOver((key) => (result[key] = this.get(key)));
    return result;
  }

  async load(files) {
    return Promise.all(
      (Array.isArray(files) ? files : [files]).map((file) => this._load(file))
    );
  }

  unload(fileName) {
    this._callFunction(this._unload, fileName);
  }

  play(fileName, options) {
    this._callFunction(this._play, fileName, options);
  }

  stop(fileName) {
    this._callFunction(this._stop, fileName);
  }

  resume(fileName) {
    this._callFunction(this._resume, fileName);
  }

  setLoop(fileName, loop) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.loop = loop;
      if (audioElement.isPlaying) audioElement.source.loop = loop;
    }
  }

  setVolume(fileName, volume) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.volume = volume;
      if (audioElement.isPlaying) audioElement.gainNode.gain.value = volume;
    }
  }

  setPan(fileName, pan) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.pan = pan;
      if (audioElement.isPlaying) audioElement.panNode.pan.value = pan;
    }
  }

  setPitch(fileName, pitch) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      audioElement.state.pitch = pitch;
      if (audioElement.isPlaying)
        audioElement.source.playbackRate.value = pitch;
    }
  }

  setMasterVolume(volume) {
    this._masterGainNode.gain.value = volume;
  }

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
          },
        };
      } catch (e) {
        return;
      }

      return fileName;
    }
  }

  _unload(fileName) {
    this.stop(fileName);
    delete this._audioMap[fileName];
  }

  _play(fileName, options = {}) {
    const audioElement = this._audioMap[fileName];
    if (audioElement) {
      this._stop(fileName);

      audioElement.source = this._audioContext.createBufferSource();
      audioElement.gainNode = this._audioContext.createGain();
      audioElement.panNode = this._audioContext.createStereoPanner();

      audioElement.source.buffer = audioElement.buffer;

      audioElement.source.connect(audioElement.gainNode);
      audioElement.gainNode.connect(audioElement.panNode);
      audioElement.panNode.connect(this._masterGainNode);

      audioElement.inited = true;

      this.setVolume(fileName, options.volume ?? 1);
      this.setPan(fileName, options.pan ?? 0);
      this.setPitch(fileName, options.pitch ?? 1);
      this.setLoop(fileName, options.loop ?? false);
      this._start(fileName, options.startTime ?? 0);
    }
  }

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
      audioElement.inited = audioElement.state.isPlaying = false;

      delete audioElement.source;
      delete audioElement.gainNode;
      delete audioElement.panNode;
    }
  }

  _resume(fileName) {
    const audioElement = this._audioMap[fileName];
    audioElement && this.play(fileName, audioElement.state);
  }

  _callFunction(func, fileName, options) {
    fileName ? func(fileName, options) : this._loopOver(func);
  }

  _loopOver(callback) {
    Object.keys(this._audioMap).forEach(callback);
  }
}
