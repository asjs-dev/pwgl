import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FPSCounter } from "../../../../extensions/src/utils/FPSCounter";
import { enterFrame } from "../../../../extensions/src/utils/enterFrame";
import { getFPS } from "../../../../extensions/src/utils/getFPS";
import { nthCall } from "../../../../extensions/src/utils/nthCall";

describe("extensions timing utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete globalThis.requestAnimationFrame;
    delete globalThis.cancelAnimationFrame;
  });

  it("tracks fps and frame delay", () => {
    let now = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const counter = FPSCounter();

    counter.update();
    now = 1016;
    counter.update();
    now = 2020;
    counter.update();

    expect(counter.delay).toBeCloseTo((2020 - 1016) / 16.6667);
    expect(counter.fps).toBeGreaterThan(0);
  });

  it("starts and stops the enterFrame loop", () => {
    const callback = vi.fn();
    let rafId = 0;
    let renderFn;

    globalThis.requestAnimationFrame = vi.fn((fn) => {
      rafId += 1;
      renderFn = fn;
      return rafId;
    });
    globalThis.cancelAnimationFrame = vi.fn();

    const loop = enterFrame(callback, 0);

    expect(loop.isPlaying()).toBe(true);
    expect(loop.getMaxFPS()).toBe(Infinity);
    expect(callback).toHaveBeenCalledOnce();
    renderFn();
    expect(callback).toHaveBeenCalledTimes(2);

    loop.stop();
    expect(loop.isPlaying()).toBe(false);
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("supports limited enterFrame fps and nthCall", () => {
    const callback = vi.fn();
    let frameHandler;

    globalThis.requestAnimationFrame = vi.fn((fn) => {
      frameHandler = fn;
      return 1;
    });
    globalThis.cancelAnimationFrame = vi.fn();

    let now = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const loop = enterFrame(callback, 10);
    expect(loop.getMaxFPS()).toBe(10);

    now = 1100;
    frameHandler();
    expect(callback).toHaveBeenCalled();

    const nth = vi.fn();
    const wrapped = nthCall(nth, 3, 1);
    wrapped("a");
    wrapped("b");
    wrapped("c");
    wrapped("d");
    wrapped("e");

    expect(nth).toHaveBeenCalledTimes(2);
    expect(nth.mock.calls).toEqual([["b"], ["e"]]);

    loop.stop();
  });

  it("measures fps from two animation frames", async () => {
    const timestamps = [100, 116.6667];

    globalThis.requestAnimationFrame = vi.fn((fn) => fn(timestamps.shift()));

    await expect(getFPS()).resolves.toBe(60);
  });
});
