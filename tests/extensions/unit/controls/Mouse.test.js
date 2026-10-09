import { describe, expect, it, vi } from "vitest";
import { Mouse } from "../../../../extensions/src/controls/Mouse";
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
    expect(target.removeEventListener).toHaveBeenCalledTimes(8);
  });

  it("tracks every button by its id and releases them on blur", () => {
    const mouse = new Mouse(createEventTargetMock());

    mouse._onMouseDown({ type: "mousedown", button: Mouse.Button.SECONDARY, clientX: 3, clientY: 4 });
    expect(mouse.isDown(Mouse.Button.SECONDARY)).toBe(true);
    expect(mouse.isDown(Mouse.Button.PRIMARY)).toBe(false);
    expect(mouse.isTapped(Mouse.Button.SECONDARY)).toBe(true);
    expect(mouse.position).toEqual({ x: 3, y: 4 });

    mouse.releaseAll();
    expect(mouse.isUp(Mouse.Button.SECONDARY)).toBe(true);
  });

  it("tracks whether the pointer is over the target and can prevent the context menu", () => {
    const mouse = new Mouse(createEventTargetMock(), { preventContextMenu: true });
    const event = { preventDefault: vi.fn() };

    expect(mouse.isOver).toBe(false);
    mouse._onMouseMove({ type: "mousemove", clientX: 1, clientY: 1 });
    expect(mouse.isOver).toBe(true);
    mouse._onMouseLeave();
    expect(mouse.isOver).toBe(false);

    mouse._onContextMenu(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
