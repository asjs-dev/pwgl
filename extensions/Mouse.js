import { PressState } from "./PressState";

export class Mouse extends PressState {
  constructor(target) {
    super();

    this.position = { x: 0, y: 0 };

    this._target = target ?? window;

    this._typeMap = {
      mousedown: 1,
      mouseup: 1,
      touchstart: 0,
      touchend: 0,
    };

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);

    this._target.addEventListener("mousedown", this._onMouseDown);
    this._target.addEventListener("mouseup", this._onMouseUp);
    this._target.addEventListener("mousemove", this._onMouseMove);
    this._target.addEventListener("touchstart", this._onMouseDown);
    this._target.addEventListener("touchend", this._onMouseUp);
    this._target.addEventListener("touchmove", this._onMouseMove);
  }

  destruct() {
    this._target.removeEventListener("mousedown", this._onMouseDown);
    this._target.removeEventListener("mouseup", this._onMouseUp);
    this._target.removeEventListener("mousemove", this._onMouseMove);
    this._target.removeEventListener("touchstart", this._onMouseDown);
    this._target.removeEventListener("touchend", this._onMouseUp);
    this._target.removeEventListener("touchmove", this._onMouseMove);
  }

  _onMouseDown(event) {
    if (this._typeMap[event.type] === event.which) {
      this.$setDownState(0);
    }
  }

  _onMouseUp(event) {
    if (this._typeMap[event.type] === event.which) {
      this.$setUpState(0);
    }
  }

  _onMouseMove(event) {
    const postion = event.type === "touchmove" ? event.touches[0] : event;

    this.position.x = postion.clientX;
    this.position.y = postion.clientY;
  }
}
