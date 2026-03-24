import { describe, expect, it, vi } from "vitest";
import { AudioItem } from "../../../../extensions/audio/AudioItem";
import { createAudioContextMock } from "../helpers/browserAudioMocks";

const createMixer = () => {
  const context = createAudioContextMock();
  return {
    context,
    node: { id: "node" },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
};

describe("AudioItem", () => {
  it("loads audio data and decodes it when connected", async () => {
    const response = {
      arrayBuffer: vi.fn(async () => new ArrayBuffer(4)),
    };
    globalThis.fetch = vi.fn(async () => response);

    const mixer = createMixer();
    const item = new AudioItem(null, { volume: 0.2, loop: true, pitch: 1.5 });
    item._audioMixer = mixer;

    await item.load("/sound.wav");
    await Promise.resolve();

    expect(globalThis.fetch).toHaveBeenCalledWith("/sound.wav");
    expect(mixer.context.decodeAudioData).toHaveBeenCalled();
    expect(item._buffer).toEqual({ duration: 8 });
  });

  it("connects to a mixer and can play, stop and resume", () => {
    const mixer = createMixer();
    const item = new AudioItem();

    item._buffer = { duration: 8 };
    item.connect(mixer);
    expect(mixer.connect).toHaveBeenCalledWith(item);

    item.play(2);
    expect(item.isPlaying).toBe(true);
    expect(item._source.start).toHaveBeenCalledWith(mixer.context.currentTime, 2);

    item.stop();
    expect(item.isPlaying).toBe(false);

    item.resume();
    expect(item.isPlaying).toBe(true);
  });

  it("disconnects and unloads", () => {
    const mixer = createMixer();
    const item = new AudioItem();

    item._audioMixer = mixer;
    item._buffer = { duration: 8 };
    item.disconnect = vi.fn(item.disconnect.bind(item));
    item.stop = vi.fn();

    item.unload();

    expect(item.stop).toHaveBeenCalled();
    expect(item._buffer).toBe(null);
  });
});
