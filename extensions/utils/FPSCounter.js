/**
 * FPS counter utility
 * @typedef {Function} FPSCounter
 * @property {function} update Update counter
 * @property {number} fps FPS
 * @property {number} delay Delay
 */
export const FPSCounter = () => {
  let frames = 0,
    prevTime = 0,
    nextTime = 0,
    then = Date.now();

  const scope = {
    fps: 0,
    delay: 0,
  };

  /**
   * Update counter
   *  - Calculate the actual FPS and delay
   */
  scope.update = () => {
    const now = Date.now();
    frames++;
    scope.delay = (now - then) / 16.6667; // 60 FPS
    then = now;

    if (now >= nextTime) {
      scope.fps = (frames * 1000) / (now - prevTime);
      prevTime = now;
      nextTime = now + 1000;
      frames = 0;
    }
  };

  return scope;
};
