import { FPS } from "../FPS";

export const enterFrame = (callback, fpsLimit = 0) => {
  const scope = {};

  let updateFunction,
    maxFPS,
    maxMS,
    correctedMS,
    then = Date.now(),
    requestAnimationFrameId,
    isPlaying = false;

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

  scope.isPlaying = () => isPlaying;

  scope.clearMaxFPS = () => {
    maxFPS = 1 / 0;
    updateFunction = updateCallback;
  };

  scope.getMaxFPS = () => maxFPS;

  scope.setMaxFPS = (fpsLimit) => {
    if (!fpsLimit || fpsLimit <= 0) return scope.clearMaxFPS();

    maxFPS = fpsLimit;
    correctedMS = maxMS = Math.floor(1000 / maxFPS) - 1;
    updateFunction = updateWithLimit;
  };

  scope.start = () => {
    if (!isPlaying) {
      isPlaying = true;
      render();
    }
  };

  scope.stop = () => {
    cancelAnimationFrame(requestAnimationFrameId);
    isPlaying = false;
  };

  scope.setMaxFPS(fpsLimit);
  scope.start();

  return scope;
};
