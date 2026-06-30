import { describe, expect, it, vi } from "vitest";
import { installPWGLMock } from "./helpers/pwglExtensionMocks";

describe("extension entrypoints", () => {
  it("exports utility helpers from the utils entrypoint", async () => {
    const utils = await import("../../../extensions/utils/index.js");

    expect(utils.clamp(0, 10, 12)).toBe(10);
    expect(utils.gridMapping.coordToVector(1, 2, 3)).toBe(7);
    expect(utils.random.hashNoise2D(1, 2)).toBeTypeOf("number");
    expect(utils.collisionDetection.areTwoRectsCollided).toBeDefined();
  });

  it("exports input helpers from the controls entrypoint", async () => {
    const controls = await import("../../../extensions/controls/index.js");

    expect(controls.PressState).toBeDefined();
    expect(controls.Mouse).toBeDefined();
    expect(controls.Keyboard).toBeDefined();
    expect(controls.Gamepad).toBeDefined();
  });

  it("exports audio helpers from the audio entrypoint", async () => {
    const audio = await import("../../../extensions/audio/index.js");

    expect(audio.AudioItem).toBeDefined();
    expect(audio.AudioMixer).toBeDefined();
    expect(audio.fadeAudioVolume).toBeDefined();
    expect(audio.crossFadeAudioVolumes).toBeDefined();
  });

  it("exports PWGL display helpers from the display entrypoint", async () => {
    vi.resetModules();
    globalThis.window = globalThis;
    globalThis.PWGL = installPWGLMock();

    const display = await import("../../../extensions/display/index.js");

    expect(display.AnimatedWater).toBeDefined();
    expect(display.SmoothLight).toBeDefined();
  });
});
