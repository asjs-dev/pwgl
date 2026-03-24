import { describe, expect, it } from "vitest";
import { Keyboard } from "../../../../extensions/controls/Keyboard";
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

  it("removes handlers on destruct", () => {
    const target = createEventTargetMock();
    const keyboard = new Keyboard(target);

    keyboard.destruct();

    expect(target.removeEventListener).toHaveBeenCalledTimes(2);
  });
});
