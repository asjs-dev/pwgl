export const enterFrame = (callback) => {
  let requestAnimationFrameId;
  let isPlaying = false;

  const render = () => {
    if (isPlaying) {
      AGL.FPS.update();
      callback(AGL.FPS.fps, AGL.FPS.delay);
      requestAnimationFrameId = requestAnimationFrame(render);
    }
  };

  const start = () => {
    if (!isPlaying) {
      isPlaying = true;
      AGL.FPS.init();
      render();
    }
  };

  const stop = () => {
    cancelAnimationFrame(requestAnimationFrameId);
    isPlaying = false;
  };

  start();

  return {
    start,
    stop,
    get isPlaying() {
      return isPlaying;
    },
  };
};
