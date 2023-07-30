export class Mouse {
  constructor() {
    this.position = { x: 0, y: 0 };

    this._state = 0;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);

    window.addEventListener("mousedown", this._onMouseDown);
    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("touchstart", this._onMouseDown);
    window.addEventListener("touchend", this._onMouseUp);
    window.addEventListener("touchmove", this._onMouseMove);
  }

  isDown() {
    return this._state === 1 && Date.now() - this._downTime > 128;
  }

  isClicked() {
    return this._state === 2 && this._upTime < 128;
  }

  destruct() {
    window.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("touchstart", this._onMouseDown);
    window.removeEventListener("touchend", this._onMouseUp);
    window.removeEventListener("touchmove", this._onMouseMove);
  }

  _onMouseDown() {
    this._state = 1;
    this._downTime = Date.now();
  }

  _onMouseUp() {
    this._state = 2;
    this._upTime = Date.now() - this._downTime;
  }

  _onMouseMove(event) {
    const { clientX, clientY } =
      event.type === "touchmove" ? event.touches[0] : event;

    this.position.x = clientX;
    this.position.y = clientY;
  }

  update() {
    this._state === 2 && (this._state = 0);
  }
}
