export class Keyboard {
  constructor() {
    this._pressedKeys = {};

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  isDown(key) {
    return this._pressedKeys[key] && this._pressedKeys[key] === 1;
  }

  isPressed(key) {
    return this._pressedKeys[key] && this._pressedKeys[key] === 2;
  }

  destruct() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }

  _onKeyDown(event) {
    this._pressedKeys[event.keyCode] = 1;
  }

  _onKeyUp(event) {
    this._pressedKeys[event.keyCode] = 2;
  }

  update() {
    const keys = this._pressedKeys;
    for (let key in keys) if (keys[key] && keys[key] === 2) keys[key] = 0;
  }
}
