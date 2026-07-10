import { describe, expect, it, vi } from "vitest";
import { installPWGLMock } from "./helpers/pwglExtensionMocks";

describe("extensions index", () => {
  const installBrowserMocks = () => {
    globalThis.window = globalThis;
    const PWGL = installPWGLMock();
    globalThis.PWGL = PWGL;
    globalThis.AGLExtensions = undefined;
    globalThis.PWGLExtensions = undefined;
    Object.defineProperty(globalThis, "navigator", {
      value: { getGamepads: () => [] },
      configurable: true,
      writable: true,
    });
    globalThis.requestAnimationFrame = (cb) => cb(0);
    globalThis.cancelAnimationFrame = () => {};
    globalThis.fetch = vi.fn();
    globalThis.window.AudioContext = vi.fn(() => ({
      createGain: () => ({ connect: () => {}, disconnect: () => {}, gain: { value: 0 } }),
      createStereoPanner: () => ({ connect: () => {}, disconnect: () => {}, pan: { value: 0 } }),
      createDelay: () => ({ connect: () => {}, disconnect: () => {}, delayTime: { value: 0 } }),
      createBiquadFilter: () => ({ connect: () => {}, disconnect: () => {}, frequency: { value: 0 }, type: "" }),
      destination: {},
    }));
    globalThis.window.webkitAudioContext = globalThis.window.AudioContext;
  };

  it("registers PWGLExtensions on window", async () => {
    vi.resetModules();
    installBrowserMocks();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await import("../../../extensions/src/index.js");

    expect(window.PWGLExtensions).toBeDefined();
    expect(window.PWGLExtensions.controls.PressState).toBeDefined();
    expect(window.PWGLExtensions.audio.fadeAudioVolume).toBeDefined();
    expect(window.PWGLExtensions.utils.createStateMachine).toBeDefined();
    expect(window.PWGLExtensions.utils.deepFreeze).toBeDefined();
    expect(window.PWGLExtensions.utils.clone).toBeUndefined();
    expect(window.PWGLExtensions.utils.createDataObserver).toBeUndefined();
    expect(window.PWGLExtensions.utils.getRandomFrom).toBeUndefined();
    expect(window.PWGLExtensions.utils.hashNoise2D).toBeUndefined();
    expect(window.PWGLExtensions.utils.gridMapping.coordToVector(1, 2, 3)).toBe(7);
    expect(window.PWGLExtensions.utils.random.getRandomFrom).toBeDefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("registers split extension entrypoints without replacing existing groups", async () => {
    vi.resetModules();
    installBrowserMocks();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await import("../../../extensions/src/utils/entry.js");

    expect(window.PWGLExtensions.utils.createStateMachine).toBeDefined();
    expect(window.PWGLExtensions.controls).toBeUndefined();

    await import("../../../extensions/src/controls/entry.js");

    expect(window.PWGLExtensions.utils.createStateMachine).toBeDefined();
    expect(window.PWGLExtensions.controls.PressState).toBeDefined();
    expect(window.AGLExtensions).toBe(window.PWGLExtensions);
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
