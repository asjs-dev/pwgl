export const getFPS = async () =>
  new Promise((resolve) => {
    requestAnimationFrame((then) =>
      requestAnimationFrame((now) => resolve(Math.round(1000 / (now - then))))
    );
  });
