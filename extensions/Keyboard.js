import { PressState } from "./PressState";

export class Keyboard extends PressState {
  constructor() {
    super();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  destruct() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }

  _onKeyDown(event) {
    this.$setDownState(event.keyCode);
  }

  _onKeyUp(event) {
    this.$setUpState(event.keyCode);
  }
}
