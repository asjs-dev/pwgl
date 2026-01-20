import { PressState } from "./PressState";

/**
 * Keyboard input handling
 * @class Keyboard
 */
export class Keyboard extends PressState {
  constructor(target) {
    super();

    this._target = target ?? window;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    this._target.addEventListener("keydown", this._onKeyDown);
    this._target.addEventListener("keyup", this._onKeyUp);
  }

  destruct() {
    this._target.removeEventListener("keydown", this._onKeyDown);
    this._target.removeEventListener("keyup", this._onKeyUp);
  }

  _onKeyDown(event) {
    this.$setDownState(event.key);
  }

  _onKeyUp(event) {
    this.$setUpState(event.key);
  }
}
