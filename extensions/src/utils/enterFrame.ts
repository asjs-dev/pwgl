import { FPSCounter } from "./FPSCounter";

export type EnterFrameCallback = (fps: number, delay: number) => void;

export type EnterFrameLoop = {
  isPlaying: () => boolean;
  clearMaxFPS: () => EnterFrameLoop;
  getMaxFPS: () => number;
  setMaxFPS: (fpsLimit: number) => EnterFrameLoop;
  start: () => EnterFrameLoop;
  stop: () => EnterFrameLoop;
};

/** Creates an enter frame loop that calls a callback function at a specified FPS limit. */
export const enterFrame = (callback: EnterFrameCallback, fpsLimit = 0): EnterFrameLoop => {
  const FPS = FPSCounter();

  let updateFunction: () => void;
  let maxFPS = Infinity;
  let maxMS = 0;
  let correctedMS = 0;
  let then = Date.now();
  let requestAnimationFrameId = 0;
  let isPlaying = false;

  const updateCallback = () => {
    FPS.update();
    callback(FPS.fps, FPS.delay);
  };

  const updateWithLimit = () => {
    const now = Date.now();
    const diff = now - then;

    if (diff >= correctedMS) {
      correctedMS = 2 * maxMS - diff;
      then = now;
      updateCallback();
    }
  };

  const render = () => {
    if (isPlaying) {
      updateFunction();
      requestAnimationFrameId = requestAnimationFrame(render);
    }
  };

  const loop: EnterFrameLoop = {
    isPlaying: () => isPlaying,

    clearMaxFPS: () => {
      maxFPS = 1 / 0;
      updateFunction = updateCallback;

      return loop;
    },

    getMaxFPS: () => maxFPS,

    setMaxFPS: (fpsLimit) => {
      if (!fpsLimit || fpsLimit <= 0) {
        return loop.clearMaxFPS();
      }

      maxFPS = fpsLimit;
      correctedMS = maxMS = Math.floor(1000 / maxFPS) - 1;
      updateFunction = updateWithLimit;

      return loop;
    },

    start: () => {
      if (!isPlaying) {
        isPlaying = true;
        render();
      }

      return loop;
    },

    stop: () => {
      cancelAnimationFrame(requestAnimationFrameId);
      isPlaying = false;

      return loop;
    },
  };

  loop.setMaxFPS(fpsLimit).start();

  return loop;
};
