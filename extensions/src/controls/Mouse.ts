// @ts-nocheck
import { PressState } from "./PressState";

const POINTER_ID = 0;
const PRIMARY_MOUSE_BUTTON = 0;
const PRIMARY_MOUSE_WHICH = 1;

/**
 * Mouse input handling
 * @class Mouse
 */
export class Mouse extends PressState {
  constructor(target) {
    super();

    this.position = { x: 0, y: 0 };

    this._target = target ?? window;

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
    if (this._isPrimaryPointerEvent(event)) {
      this.$setDownState(POINTER_ID);
    }
  }

  _onMouseUp(event) {
    if (this._isPrimaryPointerEvent(event)) {
      this.$setUpState(POINTER_ID);
    }
  }

  _onMouseMove(event) {
    const position = event.type === "touchmove" ? event.touches[0] : event;

    if (!position) {
      return;
    }

    this.position.x = position.clientX;
    this.position.y = position.clientY;
  }

  _isPrimaryPointerEvent(event) {
    return event.type.startsWith("touch") || event.button === PRIMARY_MOUSE_BUTTON || event.which === PRIMARY_MOUSE_WHICH;
  }
}
