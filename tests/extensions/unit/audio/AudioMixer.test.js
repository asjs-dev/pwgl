import { describe, expect, it, vi } from "vitest";
import { createAudioContextMock, installBasicWindowMocks } from "../helpers/browserAudioMocks";

const loadAudioMixerModule = async () => {
  const context = createAudioContextMock();
  installBasicWindowMocks();
  globalThis.window.AudioContext = vi.fn(() => context);
  globalThis.window.webkitAudioContext = vi.fn(() => context);
  return { ...(await import("../../../../extensions/src/audio/AudioMixer.js")), context };
};

describe("AudioMixer", () => {
  it("creates an audio context and main node chain", async () => {
    const { AudioMixer, context } = await loadAudioMixerModule();
    const mixer = new AudioMixer({ volume: 0.4 });

    expect(mixer.context).toBe(context);
    expect(mixer.node).toBe(mixer.$gainNode);
    expect(mixer.volume).toBe(0.4);
  });

  it("connects, disconnects and controls items", async () => {
    const { AudioMixer } = await loadAudioMixerModule();
    const mixer = new AudioMixer();
    const item = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
    };

    mixer.connect(item);
    expect(item.connect).toHaveBeenCalledWith(mixer);

    mixer.play();
    mixer.pause();
    mixer.stop();

    expect(item.play).toHaveBeenCalled();
    expect(item.pause).toHaveBeenCalled();
    expect(item.stop).toHaveBeenCalled();

    mixer.disconnect(item);
    expect(item.disconnect).toHaveBeenCalled();
  });

  it("creates a sub-mixer that shares the output mixer's context and feeds its node", async () => {
    const { AudioMixer, context } = await loadAudioMixerModule();
    const master = new AudioMixer();
    const constructions = globalThis.window.AudioContext.mock.calls.length;
    const music = new AudioMixer({ output: master, volume: 0.5 });

    expect(globalThis.window.AudioContext.mock.calls.length).toBe(constructions);
    expect(music.context).toBe(context);
    expect(music.$destinationNode).toBe(master.node);
    expect(music.volume).toBe(0.5);
  });

  it("uses a given audio context and output node", async () => {
    const { AudioMixer } = await loadAudioMixerModule();
    const own = createAudioContextMock();
    const node = { id: "bus" };
    const mixer = new AudioMixer({ context: own, output: node });

    expect(mixer.context).toBe(own);
    expect(mixer.$destinationNode).toBe(node);
  });
});
