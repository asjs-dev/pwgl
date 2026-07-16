/** Returns the current frames per second. */
export const getFPS = async (): Promise<number> =>
  new Promise((resolve) => {
    requestAnimationFrame((then) => {
      requestAnimationFrame((now) => {
        resolve(Math.round(1000 / (now - then)));
      });
    });
  });
