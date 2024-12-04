import { areObjectsEqual } from "./utils/areObjectsEqual";
import { clone } from "./utils/clone";

export class DataObserver {
  constructor(defaultState = {}) {
    this._state = defaultState;
    this._prevState = clone(this._state);
    this._run = false;
    this._checkState = this._checkState.bind(this);
    this._checkState();
  }

  start() {
    this._run = true;
  }

  stop() {
    this._run = false;
  }

  _checkState() {
    if (this._run && !areObjectsEqual(this._state, this._prevState)) {
      const stateClone = clone(this._state);
      const prevStateClone = clone(this._prevState);
      this._update(stateClone, prevStateClone);
      this._prevState = stateClone;
    }

    requestAnimationFrame(this._checkState);
  }
}
