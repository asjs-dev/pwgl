// @ts-nocheck
import { PressState } from "./PressState";

/**
 * @typedef {Object} KeyboardConfig
 * @property {boolean} [useCode=false] - Identify keys by `event.code` (the physical key, independent
 *                                        of the keyboard layout and modifiers) instead of `event.key`
 * @property {Array<string>} [preventDefault=[]] - Ids whose default browser action is prevented, such as page scrolling
 */

/**
 * Keyboard input handling. Every held key is released when the window loses focus.
 * @class Keyboard
 */
export class Keyboard extends PressState {
  /**
   * @param {EventTarget} [target=window] - Target of the key events
   * @param {KeyboardConfig} [config={}]
   */
  constructor(target, config = {}) {
    super();

    this._target = target ?? window;
    this._useCode = config.useCode ?? false;
    this._preventDefault = new Set(config.preventDefault ?? []);
    // The id each physical key went down with: with `event.key`, releasing Shift before W
    // reports "w" on key up for a "W" key down.
    this._idByCode = Object.create(null);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this.releaseAll.bind(this);

    this._target.addEventListener("keydown", this._onKeyDown);
    this._target.addEventListener("keyup", this._onKeyUp);
    globalThis.addEventListener?.("blur", this._onBlur);
  }

  destruct() {
    this._target.removeEventListener("keydown", this._onKeyDown);
    this._target.removeEventListener("keyup", this._onKeyUp);
    globalThis.removeEventListener?.("blur", this._onBlur);
  }

  _onKeyDown(event) {
    const id = this._useCode ? event.code : event.key;
    if (this._preventDefault.has(id)) {
      event.preventDefault?.();
    }
    if (event.code) {
      this._idByCode[event.code] = id;
    }
    this.$setDownState(id);
  }

  _onKeyUp(event) {
    const stored = event.code ? this._idByCode[event.code] : undefined;
    const id = stored ?? (this._useCode ? event.code : event.key);
    if (event.code) {
      delete this._idByCode[event.code];
    }
    this.$setUpState(id);
  }
}
