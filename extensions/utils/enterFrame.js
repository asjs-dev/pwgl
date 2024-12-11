import { FPS } from "../FPS";

export const enterFrame = (callback) => {
  let requestAnimationFrameId;
  let isPlaying = false;

  const render = () => {
    if (isPlaying) {
      FPS.update();
      callback(FPS.fps, FPS.delay);
      requestAnimationFrameId = requestAnimationFrame(render);
    }
  };

  const start = () => {
    if (!isPlaying) {
      isPlaying = true;
      FPS.init();
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
