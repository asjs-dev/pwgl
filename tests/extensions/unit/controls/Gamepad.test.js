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
    expect(gamepad.any).toBe(null);
    expect(gamepad.isAnyConnected()).toBe(false);
  });

  it("returns no gamepads when navigator is unavailable", () => {
    delete globalThis.navigator;

    const gamepad = new Gamepad();

    expect(gamepad.gamepads).toEqual([]);
    expect(gamepad.get(0)).toBe(null);
    expect(gamepad.any).toBe(null);
    expect(gamepad.isAnyConnected()).toBe(false);
  });

  it("supports webkitGetGamepads fallback", () => {
    setNavigatorMock({
      webkitGetGamepads: () => [
        {
          axes: [0.1],
          buttons: [0],
          timestamp: 456,
        },
      ],
    });

    const gamepad = new Gamepad();
    expect(gamepad.get(0)).toEqual({
      axes: [0.1],
      buttons: [{ pressed: false, touched: false, value: 0 }],
      timestamp: 456,
    });
  });

  it("keeps the selected navigator source for the instance", () => {
    setNavigatorMock({
      getGamepads: () => [
        {
          axes: [0.2],
          buttons: [1],
          timestamp: 1,
        },
      ],
    });

    const gamepad = new Gamepad();

    setNavigatorMock({
      getGamepads: () => [],
    });

    expect(gamepad.get(0)).toEqual({
      axes: [0.2],
      buttons: [{ pressed: true, touched: true, value: 1 }],
      timestamp: 1,
    });
  });

  it("returns the first connected gamepad", () => {
    setNavigatorMock({
      getGamepads: () => [
        null,
        {
          axes: [0.03, 0.4],
          buttons: [1],
          timestamp: 789,
        },
      ],
    });

    const gamepad = new Gamepad();

    expect(gamepad.isAnyConnected()).toBe(true);
    expect(gamepad.any).toEqual({
      axes: [0, 0.4],
      buttons: [{ pressed: true, touched: true, value: 1 }],
      timestamp: 789,
    });
  });
});
