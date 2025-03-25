export class PressState {
  constructor() {
    this._state = {};
    this._timestamp = {};
    this._duration = {};
  }

  isDown(id) {
    return this._state[id] === 0;
  }

  isUp(id) {
    return this._state[id] === 1;
  }

  isPressed(id) {
    return this.isUp(id) && this._duration[id] <= 200;
  }

  isLongPressed(id) {
    return this.isUp(id) && this._duration[id] > 200;
  }

  getDuration(id) {
    return Date.now() - this._timestamp[id];
  }

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
