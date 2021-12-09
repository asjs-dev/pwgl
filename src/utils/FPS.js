import "../namespace.js";

AGL.FPS = {
  start : function (targetFPS) {
    this._targetMS =
    this._then =
    this._frames =
    this._prevTime =

    this.fps =
    this.delay = 0;

    this._then = Date.now();
    this._targetMS = 1e3 / (targetFPS || 60);
  },
  update : function() {
    this._frames++;

    const now = Date.now();

    this.delay = (now - this._then) / this._targetMS;

    if (now >= this._prevTime + 1e3 ) {
      this.fps = (this._frames * 1e3) / (now - this._prevTime);

      this._prevTime = now;
      this._frames = 0;
    }

    this._then = now;
  }
};
