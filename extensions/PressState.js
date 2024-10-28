export class PressState {
  constructor() {
    this._downState = {};
    this._upState = {};
  }

  isDown(id) {
    return this._downState[id] > this._upState[id];
  }

  isPressing(id) {
    return this.isDown(key) && Date.now() - this._downState[id] > 128;
  }

  isPressed(id) {
    return Date.now() - this._upState[id] < 16;
  }

  isLongPressed(id) {
    return this._upState[id] - this._downState[id] > 256;
  }

  $setDownState(id) {
    this._upState[id] = 0;
    this._downState[id] = Date.now();
  }

  $setUpState(id) {
    this._upState[id] = Date.now();
  }
}
