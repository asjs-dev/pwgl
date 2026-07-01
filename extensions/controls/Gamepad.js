import { noopReturnsWith } from "../utils/noopReturnsWith";

const mapGamepadButton = (button) =>
  typeof button === "number" ? { pressed: button === 1, touched: button === 1, value: button } : button;

const mapGamepadAxes = (axes) => axes.map((value) => (Math.abs(value) >= 0.05 ? value : 0));

const mapGamepad = (gamepad) =>
  gamepad
    ? {
        axes: mapGamepadAxes(gamepad.axes),
        buttons: gamepad.buttons.map(mapGamepadButton),
        timestamp: gamepad.timestamp,
      }
    : null;

/**
 * Gamepad input handling
 * @class Gamepad
 */
export class Gamepad {
  constructor() {
    const source = globalThis.navigator;

    this._gamepads =
      (source && (source.getGamepads?.bind(source) || source.webkitGetGamepads?.bind(source))) ?? noopReturnsWith([]);
  }

  isAnyConnected() {
    return this.gamepads.some((gamepad) => gamepad);
  }

  get(id) {
    return mapGamepad(this.gamepads[id]);
  }

  get gamepads() {
    return this._gamepads();
  }

  get any() {
    return mapGamepad(this.gamepads.find((gamepad) => gamepad));
  }
}
