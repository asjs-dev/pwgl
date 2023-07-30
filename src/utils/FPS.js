/**
 * FPS counter utility
 * @typedef {Object} FPS
 * @property {function(number)} start Start counting
 * @property {function} update Update counter
 */
export const FPS = {
  /**
   * Start counting
   * @param {number} [targetFPS=60] Target FPS 
   *                                  - value of the target FPS, for example 60
   */
  start: function (targetFPS = 60) {
    this._targetMS =
      this._then =
      this._frames =
      this._prevTime =
      this.fps =
      this.delay =
        0;

    this._then = Date.now();
    this._targetMS = 1000 / targetFPS;
  },

  /**
   * Update counter
   *  - Calculate the actual FPS
   */
  update: function () {
    this._frames++;

    const now = Date.now();

    this.delay = (now - this._then) / this._targetMS;

    if (now >= this._prevTime + 1000) {
      this.fps = (this._frames * 1000) / (now - this._prevTime);

      this._prevTime = now;
      this._frames = 0;
    }

    this._then = now;
  },
};
