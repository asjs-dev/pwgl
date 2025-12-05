import { BaseAudio } from "./BaseAudio";

/**
 * AudioMixer class that extends BaseAudio to manage and control multiple audio items.
 * It initializes an audio context, creates and connects audio nodes, and provides methods
 * to play, stop, resume, connect, and disconnect audio items.
 */
export class AudioMixer extends BaseAudio {
  /**
   * Creates an instance of AudioMixer.
   * Initializes the audio context, creates and connects audio nodes, and sets config.
   *
   * @param {Object} [config={}] - Configuration for the audio mixer.
   */
  constructor(config = {}) {
    super();

    const context = new (window.AudioContext || window.webkitAudioContext)();
    this._context = context;

    this._items = [];
    this.$createNodes(context);
    this.$connectNodes(context.destination);
    this.$setConfig(config);
  }

  /**
   * Gets the context.
   * @returns {Object} The current context.
   */
  get context() {
    return this._context;
  }

  /**
   * Gets the main node.
   * @returns {AudioNode} The main node associated with this instance.
   */
  get node() {
    return this.$gainNode;
  }

  /**
   * Plays all items in the collection.
   */
  play() {
    this._items.forEach((item) => item.play());
  }

  /**
   * Stops all items in the collection and then calls the parent class's stop method.
   */
  stop() {
    this._items.forEach((item) => item.stop());
  }

  /**
   * Cleans up the AudioMixer instance by stopping any ongoing processes
   * and disconnecting audio nodes.
   */
  destruct() {
    this.stop();
    this.$disconnectNodes();
  }

  /**
   * Resumes all items in the collection by calling their resume method.
   */
  resume() {
    this._items.forEach((item) => item.resume());
  }

  /**
   * Connects an audio item to the current instance if it is not already connected.
   * If the audio item is not in the list of items, it adds the audio item to the list
   * and calls the connect method on the audio item, passing the current instance.
   *
   * @param {Object} audioItem - The audio item to be connected.
   */
  connect(audioItem) {
    if (!this._items.includes(audioItem)) {
      this._items.push(audioItem);
      audioItem.connect(this);
    }
  }

  /**
   * Disconnects the specified audio item from the list of items and calls its disconnect method.
   *
   * @param {Object} audioItem - The audio item to be disconnected.
   */
  disconnect(audioItem) {
    if (this._items.includes(audioItem)) {
      this._items.splice(this._items.indexOf(audioItem), 1);
      audioItem.disconnect();
    }
  }
}
