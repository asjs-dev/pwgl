export class PressState {
  constructor() {
    this._downState = {};
    this._upState = {};
    this._updateTime = Date.now();
    this._delay;
  }

  isDown(id) {
    return this._downState[id] > this._upState[id];
  }

  isUp(id) {
    return Date.now() - this._upState[id] <= this._delay;
  }

  isPressed(id) {
    return this.isUp(id) && this._upState[id] - this._downState[id] <= 128;
  }

  isLongPressed(id) {
    return this.isUp(id) && this._upState[id] - this._downState[id] > 128;
  }

  update() {
    const now = Date.now();
    this._delay = now - this._updateTime;
    this._updateTime = now;
  }

  $setDownState(id) {
    this._upState[id] = 0;
    this._downState[id] = Date.now();
  }

  $setUpState(id) {
    this._upState[id] = Date.now();
  }
}
