import { describe, expect, it, vi } from "vitest";
import { PressState } from "../../../../extensions/controls/PressState";

describe("PressState", () => {
  it("tracks down, up, pressed and long-pressed states", () => {
    const state = new PressState();
    const timeSpy = vi.spyOn(Date, "now");

    timeSpy.mockReturnValueOnce(1000);
    state.$setDownState("Space");
    expect(state.isDown("Space")).toBe(true);

    timeSpy.mockReturnValueOnce(1100);
    state.$setUpState("Space");
    expect(state.isUp("Space")).toBe(true);
    expect(state.isPressed("Space")).toBe(true);
    expect(state.isLongPressed("Space")).toBe(false);

    timeSpy.mockRestore();
  });

  it("clears released states on update", () => {
    const state = new PressState();

    state._state.A = 1;
    state._duration.A = 10;
    state._timestamp.A = 1000;
    state.update();

    expect(state._state.A).toBeUndefined();
    expect(state._duration.A).toBeUndefined();
    expect(state._timestamp.A).toBeUndefined();
  });
});
