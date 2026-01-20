/**
 * Press state tracking for input controls
 * @class PressState
 */
export class PressState {
  constructor() {
    this._state = {};
    this._timestamp = {};
    this._duration = {};
  }

  /**
   * Checks if the given id is currently down
   * @param {string|number} id The identifier to check
   * @returns {boolean} True if down, false otherwise
   */
  isDown(id) {
    return this._state[id] === 0;
  }

  /**
   * Checks if the given id is currently up
   * @param {string|number} id The identifier to check
   * @returns {boolean} True if up, false otherwise
   */
  isUp(id) {
    return this._state[id] === 1;
  }

  /**
   * Checks if the given id was a short press
   * @param {string|number} id The identifier to check
   * @returns {boolean} True if it was a short press, false otherwise
   */
  isPressed(id) {
    return this.isUp(id) && this._duration[id] <= 200;
  }

  /**
   * Checks if the given id was a long press
   * @param {string|number} id The identifier to check
   * @returns {boolean} True if it was a long press, false otherwise
   */
  isLongPressed(id) {
    return this.isUp(id) && this._duration[id] > 200;
  }

  /**
   * Gets the duration the given id was held down
   * @param {string|number} id The identifier to check
   * @returns {number} The duration in milliseconds
   */
  getDuration(id) {
    return Date.now() - this._timestamp[id];
  }

  /**
   * Updates the press state, clearing any completed states
   */
  update() {
    for (let key in this._state)
      if (this._state[key]) {
        delete this._state[key];
        delete this._duration[key];
        delete this._timestamp[key];
      }
  }

  $setDownState(id) {
    this._state[id] = 0;
    this._timestamp[id] = Date.now();
  }

  $setUpState(id) {
    const now = Date.now();
    this._state[id] = 1;
    this._duration[id] = now - this._timestamp[id];
    this._timestamp[id] = now;
  }
}
