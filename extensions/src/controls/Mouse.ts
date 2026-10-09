// @ts-nocheck
import { PressState } from "./PressState";

const PRIMARY_MOUSE_WHICH = 1;

/**
 * @typedef {Object} MouseConfig
 * @property {boolean} [preventContextMenu=false] - Prevent the context menu on the target, so the
 *                                                  secondary button can be used in the game
 */

/**
 * Mouse and touch input handling. Buttons are identified by `Mouse.Button`; touches count as the
 * primary button. A button released outside the target, or while the window loses focus, is
 * released too.
 * @class Mouse
 */
export class Mouse extends PressState {
  /**
   * @param {EventTarget} [target=window] - Target of the mouse and touch events
   * @param {MouseConfig} [config={}]
   */
  constructor(target, config = {}) {
    super();

    this.position = { x: 0, y: 0 };
    this.isOver = false;

    this._target = target ?? window;
    this._preventContextMenu = config.preventContextMenu ?? false;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onBlur = this.releaseAll.bind(this);

    this._target.addEventListener("mousedown", this._onMouseDown);
    this._target.addEventListener("mouseup", this._onMouseUp);
    this._target.addEventListener("mousemove", this._onMouseMove);
    this._target.addEventListener("mouseleave", this._onMouseLeave);
    this._target.addEventListener("contextmenu", this._onContextMenu);
    this._target.addEventListener("touchstart", this._onMouseDown);
    this._target.addEventListener("touchend", this._onMouseUp);
    this._target.addEventListener("touchmove", this._onMouseMove);
    if (this._target !== globalThis) {
      globalThis.addEventListener?.("mouseup", this._onMouseUp);
    }
    globalThis.addEventListener?.("blur", this._onBlur);
  }

  destruct() {
    this._target.removeEventListener("mousedown", this._onMouseDown);
    this._target.removeEventListener("mouseup", this._onMouseUp);
    this._target.removeEventListener("mousemove", this._onMouseMove);
    this._target.removeEventListener("mouseleave", this._onMouseLeave);
    this._target.removeEventListener("contextmenu", this._onContextMenu);
    this._target.removeEventListener("touchstart", this._onMouseDown);
    this._target.removeEventListener("touchend", this._onMouseUp);
    this._target.removeEventListener("touchmove", this._onMouseMove);
    if (this._target !== globalThis) {
      globalThis.removeEventListener?.("mouseup", this._onMouseUp);
    }
    globalThis.removeEventListener?.("blur", this._onBlur);
  }

  _onMouseDown(event) {
    this._onMouseMove(event);
    this.$setDownState(this._getButton(event));
  }

  _onMouseUp(event) {
    this.$setUpState(this._getButton(event));
  }

  _onMouseMove(event) {
    const position = event.type.startsWith("touch") ? event.touches?.[0] : event;

    if (!position) {
      return;
    }

    this.isOver = true;
    this.position.x = position.clientX;
    this.position.y = position.clientY;
  }

  _onMouseLeave() {
    this.isOver = false;
  }

  _onContextMenu(event) {
    if (this._preventContextMenu) {
      event.preventDefault();
    }
  }

  _getButton(event) {
    if (event.type.startsWith("touch")) {
      return Mouse.Button.PRIMARY;
    }
    return event.button ?? (event.which === PRIMARY_MOUSE_WHICH ? Mouse.Button.PRIMARY : event.which - 1);
  }
}

/**
 * Mouse button ids
 * @member
 * @property {number} PRIMARY
 * @property {number} MIDDLE
 * @property {number} SECONDARY
 */
Mouse.Button = {
  PRIMARY: 0,
  MIDDLE: 1,
  SECONDARY: 2,
};
