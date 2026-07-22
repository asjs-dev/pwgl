export type FPSCounterState = {
  update: () => void;
  fps: number;
  delay: number;
};

/** FPS counter utility. */
export const FPSCounter = (): FPSCounterState => {
  let frames = 0;
  let prevTime = 0;
  let nextTime = 0;
  let then = Date.now();

  const counter: FPSCounterState = {
    fps: 0,
    delay: 0,

    update: () => {
      const now = Date.now();
      frames++;
      counter.delay = (now - then) / 16.6667; // 60 FPS
      then = now;

      if (now >= nextTime) {
        counter.fps = (frames * 1000) / (now - prevTime);
        prevTime = now;
        nextTime = now + 1000;
        frames = 0;
      }
    },
  };

  return counter;
};
