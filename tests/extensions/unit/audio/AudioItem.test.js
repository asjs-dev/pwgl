import { describe, expect, it, vi } from "vitest";
import { AudioItem } from "../../../../extensions/src/audio/AudioItem";
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

  it("uses decoded audio data without fetching it", () => {
    globalThis.fetch = vi.fn();
    const buffer = { duration: 2 };
    const mixer = createMixer();
    const first = new AudioItem(buffer);
    const second = new AudioItem(buffer);

    first.connect(mixer);
    second.connect(mixer);
    first.play();
    second.play();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(mixer.context.decodeAudioData).not.toHaveBeenCalled();
    expect(first.duration).toBe(2);
    expect(first._source.buffer).toBe(buffer);
    expect(second._source.buffer).toBe(buffer);
    expect(first._source).not.toBe(second._source);
    expect(first.isPlaying && second.isPlaying).toBe(true);
  });

  it("connects to a mixer and can play, pause, and stop", () => {
    const mixer = createMixer();
    const item = new AudioItem();

    item._buffer = { duration: 8 };
    item.connect(mixer);
    expect(mixer.connect).toHaveBeenCalledWith(item);

    item.play(2);
    expect(item.isPlaying).toBe(true);
    expect(item._source.start).toHaveBeenCalledWith(mixer.context.currentTime, 2);
    expect(item.currentTime).toBe(2);

    mixer.context.currentTime = 15;
    item.pause();
    expect(item.isPlaying).toBe(false);
    expect(item.isPaused).toBe(true);
    expect(item.seek).toBe(5);
    expect(item.currentTime).toBe(5);

    item.play();
    expect(item.isPlaying).toBe(true);
    expect(item._source.start).toHaveBeenCalledWith(mixer.context.currentTime, 5);

    item.stop();
    expect(item.isPlaying).toBe(false);
    expect(item.isPaused).toBe(false);
    expect(item.seek).toBe(0);
  });

  it("seeks without starting stopped audio and restarts active playback when playing", () => {
    const mixer = createMixer();
    const item = new AudioItem();

    item._buffer = { duration: 8 };
    item.connect(mixer);

    item.seek = 20;
    expect(item.seek).toBe(8);
    expect(item.isPlaying).toBe(false);

    item.play();
    expect(item._source.start).toHaveBeenCalledWith(mixer.context.currentTime, 8);

    item.seek = 3;
    expect(item.isPlaying).toBe(true);
    expect(item._source.start).toHaveBeenLastCalledWith(mixer.context.currentTime, 3);
  });

  it("normalizes invalid pitch values", () => {
    const mixer = createMixer();
    const item = new AudioItem(null, { pitch: Number.NaN });

    item._buffer = { duration: 8 };
    item.connect(mixer);
    item.play();

    expect(item.pitch).toBe(1);
    expect(item._source.playbackRate.value).toBe(1);

    item.pitch = -2;

    expect(item.pitch).toBe(0);
    expect(item._source.playbackRate.value).toBe(0);
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
