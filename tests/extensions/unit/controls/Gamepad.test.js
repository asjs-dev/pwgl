import { describe, expect, it } from "vitest";
import { Gamepad } from "../../../../extensions/controls/Gamepad";

const setNavigatorMock = (value) => {
  Object.defineProperty(globalThis, "navigator", {
    value,
    configurable: true,
    writable: true,
  });
};

describe("Gamepad", () => {
  it("normalizes axes and button states from navigator gamepads", () => {
    setNavigatorMock({
      getGamepads: () => [
        {
          axes: [0.01, -0.2],
          buttons: [1, { pressed: false, touched: true, value: 0.5 }],
          timestamp: 123,
        },
      ],
    });

    const gamepad = new Gamepad();
    expect(gamepad.get(0)).toEqual({
      axes: [0, -0.2],
      buttons: [
        { pressed: true, touched: true, value: 1 },
        { pressed: false, touched: true, value: 0.5 },
      ],
      timestamp: 123,
    });
  });

  it("returns null for missing gamepads", () => {
    setNavigatorMock({
      getGamepads: () => [],
    });

    const gamepad = new Gamepad();
    expect(gamepad.get(0)).toBe(null);
  });
});
