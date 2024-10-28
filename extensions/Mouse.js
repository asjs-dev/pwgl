import { PressState } from "./PressState";

export class Mouse extends PressState {
  constructor() {
    super();

    this.position = { x: 0, y: 0 };

    this._typeMap = {
      mousedown: 1,
      mouseup: 1,
      touchstart: 0,
      touchend: 0,
    };

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

  destruct() {
    window.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("touchstart", this._onMouseDown);
    window.removeEventListener("touchend", this._onMouseUp);
    window.removeEventListener("touchmove", this._onMouseMove);
  }

  _onMouseDown({ type, which }) {
    if (this._typeMap[type] === which) {
      this.$setDownState(0);
    }
  }

  _onMouseUp({ type, which }) {
    if (this._typeMap[type] === which) {
      this.$setUpState(0);
    }
  }

  _onMouseMove(event) {
    const { clientX, clientY } =
      event.type === "touchmove" ? event.touches[0] : event;

    this.position.x = clientX;
    this.position.y = clientY;
  }
}
