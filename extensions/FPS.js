/**
 * FPS counter utility
 * @typedef {Object} FPS
 * @property {function} init Init FPS counter
 * @property {function} update Update counter
 */
export const FPS = {
  /**
   * Init counter
   */
  init() {
    this.fps = this.delay = this._then = this._frames = this._prevTime = 0;
    this._then = Date.now();
    this._targetMS = 1000 / 60;
  },

  /**
   * Update counter
   *  - Calculate the actual FPS and delay
   */
  update() {
    const now = Date.now();
    this.delay = (now - this._then) / this._targetMS;
    this._then = now;
    this._frames++;

    if (now >= this._prevTime + 1000) {
      this.fps = (this._frames * 1000) / (now - this._prevTime);
      this._prevTime = now;
      this._frames = 0;
    }
  },
};

// For backwards compatibility
FPS.start = FPS.init;
