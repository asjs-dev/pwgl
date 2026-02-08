/**
 * Returns the current frames per second (FPS)
 * @returns {number} The current FPS
 */
export const getFPS = async () =>
  new Promise((resolve) => {
    requestAnimationFrame((then) =>
      requestAnimationFrame((now) => resolve(Math.round(1000 / (now - then)))),
    );
  });
