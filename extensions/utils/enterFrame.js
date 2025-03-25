import { FPS } from "../FPS";

export const enterFrame = (callback) => {
  let requestAnimationFrameId,
    isPlaying = false;

  const render = () => {
      if (isPlaying) {
        FPS.update();
        callback(FPS.fps, FPS.delay);
        requestAnimationFrameId = requestAnimationFrame(render);
      }
    },
    start = () => {
      if (!isPlaying) {
        isPlaying = true;
        FPS.init();
        render();
      }
    },
    stop = () => {
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
