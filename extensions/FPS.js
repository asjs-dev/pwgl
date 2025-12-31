import { noop } from "./utils/noop";

/**
 * FPS counter utility
 * @typedef {Object} FPS
 * @property {function} init noop function for backward compatibility
 * @property {function} start noop function for backward compatibility
 * @property {function} update Update counter
 */
export const FPS = (() => {
  const scope = {
    fps: 0,
    delay: 0,
  };

  const targetMS = 16.6667; // 60 FPS

  let frames = 0,
    prevTime = 0,
    nextTime = 0,
    then = Date.now();

  /**
   * Update counter
   *  - Calculate the actual FPS and delay
   */
  scope.update = () => {
    const now = Date.now();
    frames++;
    scope.delay = (now - then) / targetMS;
    then = now;

    if (now >= nextTime) {
      scope.fps = (frames * 1000) / (now - prevTime);
      prevTime = now;
      nextTime = now + 1000;
      frames = 0;
    }
  };

  // For backwards compatibility
  scope.init = scope.start = noop;

  return scope;
})();
