// @ts-nocheck
const DOWN = 0;
const UP = 1;
const LONG_PRESS_THRESHOLD_MS = 200;

/**
 * Press state tracking for input controls
 * @class PressState
 */
export class PressState {
  constructor() {
    this._state = Object.create(null);
    this._timestamp = Object.create(null);
    this._duration = Object.create(null);
    this._tapped = Object.create(null);
  }

  /**
   * Checks if the given id went down since the last update, even if it has been released since
   * @param {string|number} id - The identifier to check
   * @returns {boolean} True if it was pressed since the last update, false otherwise
   */
  isTapped(id) {
    return this._tapped[id] === true;
  }

  /**
   * Checks if the given id is currently down
   * @param {string|number} id - The identifier to check
   * @returns {boolean} True if down, false otherwise
   */
  isDown(id) {
    return this._state[id] === DOWN;
  }

  /**
   * Checks if the given id is currently up
   * @param {string|number} id - The identifier to check
   * @returns {boolean} True if up, false otherwise
   */
  isUp(id) {
    return this._state[id] === UP;
  }

  /**
   * Checks if the given id was a short press
   * @param {string|number} id - The identifier to check
   * @returns {boolean} True if it was a short press, false otherwise
   */
  isPressed(id) {
    return this.isUp(id) && this._duration[id] <= LONG_PRESS_THRESHOLD_MS;
  }

  /**
   * Checks if the given id was a long press
   * @param {string|number} id - The identifier to check
   * @returns {boolean} True if it was a long press, false otherwise
   */
  isLongPressed(id) {
    return this.isUp(id) && this._duration[id] > LONG_PRESS_THRESHOLD_MS;
  }

  /**
   * Gets the duration the given id was held down
   * @param {string|number} id - The identifier to check
   * @returns {number} The duration in milliseconds
   */
  getDuration(id) {
    const timestamp = this._timestamp[id];
    return timestamp === undefined ? 0 : Date.now() - timestamp;
  }

  /**
   * Releases every held id, for example when the window loses focus
   */
  releaseAll() {
    for (let key in this._state) {
      this.$setUpState(key);
    }
  }

  /**
   * Updates the press state, clearing any completed states and taps
   */
  update() {
    for (let key in this._tapped) {
      delete this._tapped[key];
    }

    for (let key in this._state) {
      if (this._state[key] === UP) {
        delete this._state[key];
        delete this._duration[key];
        delete this._timestamp[key];
      }
    }
  }

  $setDownState(id) {
    if (this.isDown(id)) {
      return;
    }

    this._state[id] = DOWN;
    this._timestamp[id] = Date.now();
    this._tapped[id] = true;
  }

  $setUpState(id) {
    if (!this.isDown(id)) {
      return;
    }

    const now = Date.now();
    this._state[id] = UP;
    this._duration[id] = now - this._timestamp[id];
    this._timestamp[id] = now;
  }
}
