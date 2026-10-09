import { describe, expect, it, vi } from "vitest";
import { PressState } from "../../../../extensions/src/controls/PressState";

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

  it("ignores repeated down events while already held", () => {
    const state = new PressState();
    const timeSpy = vi.spyOn(Date, "now");
    let now = 1000;

    timeSpy.mockImplementation(() => now);
    state.$setDownState("Space");

    now = 1050;
    state.$setDownState("Space");

    now = 1300;
    state.$setUpState("Space");

    expect(state.isLongPressed("Space")).toBe(true);

    timeSpy.mockRestore();
  });

  it("keeps a tap until the next update, even if it was released before", () => {
    const state = new PressState();

    state.$setDownState("Space");
    state.$setUpState("Space");
    expect(state.isTapped("Space")).toBe(true);
    expect(state.isDown("Space")).toBe(false);

    state.update();
    expect(state.isTapped("Space")).toBe(false);
  });

  it("releases every held id", () => {
    const state = new PressState();

    state.$setDownState("A");
    state.$setDownState(0);
    state.releaseAll();

    expect(state.isDown("A")).toBe(false);
    expect(state.isDown(0)).toBe(false);
    expect(state.isUp("A")).toBe(true);
  });

  it("ignores up events without a matching down state", () => {
    const state = new PressState();

    state.$setUpState("Space");

    expect(state.isUp("Space")).toBe(false);
    expect(state.isPressed("Space")).toBe(false);
    expect(state.isLongPressed("Space")).toBe(false);
    expect(state.getDuration("Space")).toBe(0);
  });
});
