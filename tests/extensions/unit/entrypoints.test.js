import { describe, expect, it, vi } from "vitest";
import { installPWGLMock } from "./helpers/pwglExtensionMocks";

describe("extension entrypoints", () => {
  it("exports extension groups from the tree-shakeable root entrypoint", async () => {
    vi.resetModules();
    globalThis.window = globalThis;
    globalThis.PWGL = installPWGLMock();

    const extensions = await import("../../../extensions/src/exports.ts");

    expect(extensions.version).toBe("{{appVersion}}");
    expect(extensions.controls.PressState).toBeDefined();
    expect(extensions.audio.fadeAudioVolume).toBeDefined();
    expect(extensions.textureAtlas.parse).toBeDefined();
    expect(extensions.utils.createIsoUtils).toBeDefined();
    expect(extensions.display.AnimatedWater).toBeDefined();
    expect(window.PWGLExtensions).toBeUndefined();
  });

  it("exports utility helpers from the utils entrypoint", async () => {
    const utils = await import("../../../extensions/src/utils/index.ts");

    expect(utils.clamp(0, 10, 12)).toBe(10);
    expect(utils.deepFreeze).toBeDefined();
    expect(utils.getUniqueId()).toBeTypeOf("number");
    expect(utils.startup).toBeDefined();
    expect(utils.createIsoUtils(64).toIsoCoordinates({ x: 1, y: 0 })).toEqual({ x: 32, y: 16 });
    expect(utils.gridMapping.coordToVector(1, 2, 3)).toBe(7);
    expect(utils.random.hashNoise2D(1, 2)).toBeTypeOf("number");
    expect(utils.collisionDetection.areTwoRectsCollided).toBeDefined();
    expect(utils.coordToVector).toBeUndefined();
    expect(utils.hashNoise2D).toBeUndefined();
    expect(utils.areTwoRectsCollided).toBeUndefined();
  });

  it("exports input helpers from the controls entrypoint", async () => {
    const controls = await import("../../../extensions/src/controls/index.js");

    expect(controls.PressState).toBeDefined();
    expect(controls.Mouse).toBeDefined();
    expect(controls.Keyboard).toBeDefined();
    expect(controls.Gamepad).toBeDefined();
  });

  it("exports audio helpers from the audio entrypoint", async () => {
    const audio = await import("../../../extensions/src/audio/index.js");

    expect(audio.AudioItem).toBeDefined();
    expect(audio.AudioMixer).toBeDefined();
    expect(audio.BaseAudioFilter).toBeDefined();
    expect(audio.LowPassAudioFilter).toBeDefined();
    expect(audio.HighPassAudioFilter).toBeDefined();
    expect(audio.BandPassAudioFilter).toBeDefined();
    expect(audio.NotchAudioFilter).toBeDefined();
    expect(audio.PeakingAudioFilter).toBeDefined();
    expect(audio.LowShelfAudioFilter).toBeDefined();
    expect(audio.HighShelfAudioFilter).toBeDefined();
    expect(audio.fadeAudioVolume).toBeDefined();
    expect(audio.crossFadeAudioVolumes).toBeDefined();
  });

  it("exports PWGL display helpers from the display entrypoint", async () => {
    vi.resetModules();
    globalThis.window = globalThis;
    globalThis.PWGL = installPWGLMock();

    const display = await import("../../../extensions/src/display/index.js");

    expect(display.AnimatedWater).toBeDefined();
    expect(display.SmoothLight).toBeDefined();
  });

  it("exports texture atlas helpers from the texture atlas entrypoint", async () => {
    const textureAtlas = await import("../../../extensions/src/textureAtlas/index.ts");

    expect(textureAtlas.create).toBeDefined();
    expect(textureAtlas.parse).toBeDefined();
    expect(textureAtlas.getImage).toBeDefined();
    expect(textureAtlas.Atlas).toBeUndefined();
  });
});
