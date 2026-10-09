import { describe, expect, it, vi } from "vitest";
import { Keyboard } from "../../../../extensions/src/controls/Keyboard";
import { createEventTargetMock } from "../helpers/browserAudioMocks";

describe("Keyboard", () => {
  it("registers handlers and updates key state", () => {
    const target = createEventTargetMock();
    const keyboard = new Keyboard(target);

    expect(target.addEventListener).toHaveBeenCalledTimes(2);

    keyboard._onKeyDown({ key: "a" });
    expect(keyboard.isDown("a")).toBe(true);

    keyboard._onKeyUp({ key: "a" });
    expect(keyboard.isUp("a")).toBe(true);
  });

  it("identifies keys by physical code and prevents chosen defaults", () => {
    const keyboard = new Keyboard(createEventTargetMock(), { useCode: true, preventDefault: ["Space"] });
    const space = { key: " ", code: "Space", preventDefault: vi.fn() };

    keyboard._onKeyDown(space);
    expect(keyboard.isDown("Space")).toBe(true);
    expect(space.preventDefault).toHaveBeenCalled();

    keyboard._onKeyDown({ key: "W", code: "KeyW" });
    expect(keyboard.isDown("KeyW")).toBe(true);
  });

  it("releases a key by the id it went down with when a modifier changes it", () => {
    const keyboard = new Keyboard(createEventTargetMock());

    keyboard._onKeyDown({ key: "W", code: "KeyW" });
    keyboard._onKeyUp({ key: "w", code: "KeyW" });

    expect(keyboard.isDown("W")).toBe(false);
    expect(keyboard.isUp("W")).toBe(true);
  });

  it("removes handlers on destruct", () => {
    const target = createEventTargetMock();
    const keyboard = new Keyboard(target);

    keyboard.destruct();

    expect(target.removeEventListener).toHaveBeenCalledTimes(2);
  });
});
