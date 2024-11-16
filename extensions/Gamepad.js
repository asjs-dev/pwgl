export class Gamepad {
  get gamepads() {
    return navigator.getGamepads
      ? navigator.getGamepads()
      : navigator.webkitGetGamepads || [];
  }

  get(id) {
    const gamepad = this.gamepads[id];
    return gamepad
      ? {
          axes: gamepad.axes.map((value) =>
            Math.abs(value) >= 0.05 ? value : 0
          ),
          buttons: gamepad.buttons.map((button) =>
            typeof button === "number"
              ? { pressed: button === 1, touched: button === 1, value: button }
              : button
          ),
          timestamp: gamepad.timestamp,
        }
      : null;
  }
}
