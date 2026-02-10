import { FPSCounter } from "./FPSCounter";

/**
 * Creates an enter frame loop that calls a callback function at a specified FPS limit
 * @param {function} callback - The function to call on each frame
 * @param {number} fpsLimit - The maximum FPS limit (0 for unlimited)
 * @returns {object} An object with methods to control the loop
 */
export const enterFrame = (callback, fpsLimit = 0) => {
  const FPS = FPSCounter();

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

  const scope = {
    /**
     * Returns whether the enter frame loop is currently playing
     * @returns {boolean} True if the loop is playing, false otherwise
     */
    isPlaying: () => isPlaying,

    /**
     * Clears the FPS limit, allowing the loop to run at unlimited FPS
     */
    clearMaxFPS: () => {
      maxFPS = 1 / 0;
      updateFunction = updateCallback;

      return scope;
    },

    /**
     * Returns the maximum FPS limit
     * @returns {number} The maximum FPS limit
     */
    getMaxFPS: () => maxFPS,

    /**
     * Sets the maximum FPS limit
     * @param {number} fpsLimit - The maximum FPS limit (0 for unlimited)
     */
    setMaxFPS: (fpsLimit) => {
      if (!fpsLimit || fpsLimit <= 0) return scope.clearMaxFPS();

      maxFPS = fpsLimit;
      correctedMS = maxMS = Math.floor(1000 / maxFPS) - 1;
      updateFunction = updateWithLimit;

      return scope;
    },

    /**
     * Starts the enter frame loop
     */
    start: () => {
      if (!isPlaying) {
        isPlaying = true;
        render();
      }

      return scope;
    },

    /**
     * Stops the enter frame loop
     */
    stop: () => {
      cancelAnimationFrame(requestAnimationFrameId);
      isPlaying = false;

      return scope;
    },
  };

  scope.setMaxFPS(fpsLimit).start();

  return scope;
};
