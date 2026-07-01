import { describe, expect, it } from "vitest";
import { Mouse } from "../../../../extensions/controls/Mouse";
import { createEventTargetMock } from "../helpers/browserAudioMocks";

describe("Mouse", () => {
  it("tracks button state and pointer position", () => {
    const target = createEventTargetMock();
    const mouse = new Mouse(target);

    mouse._onMouseDown({ type: "mousedown", button: 0 });
    expect(mouse.isDown(0)).toBe(true);

    mouse._onMouseMove({ type: "mousemove", clientX: 20, clientY: 30 });
    expect(mouse.position).toEqual({ x: 20, y: 30 });

    mouse._onMouseUp({ type: "mouseup", button: 0 });
    expect(mouse.isUp(0)).toBe(true);
  });

  it("handles touch press, movement and release", () => {
    const target = createEventTargetMock();
    const mouse = new Mouse(target);

    mouse._onMouseDown({ type: "touchstart" });
    expect(mouse.isDown(0)).toBe(true);

    mouse._onMouseMove({ type: "touchmove", touches: [{ clientX: 5, clientY: 6 }] });
    expect(mouse.position).toEqual({ x: 5, y: 6 });

    mouse._onMouseUp({ type: "touchend" });
    expect(mouse.isUp(0)).toBe(true);
  });

  it("ignores empty touch movement and removes handlers", () => {
    const target = createEventTargetMock();
    const mouse = new Mouse(target);

    mouse._onMouseMove({ type: "touchmove", touches: [] });
    expect(mouse.position).toEqual({ x: 0, y: 0 });

    mouse.destruct();
    expect(target.removeEventListener).toHaveBeenCalledTimes(6);
  });
});
