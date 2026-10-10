import { Stage2D, Texture, Utils } from "../../../src/exports";
import { READY_TIMEOUT, withTimeout } from "../checks";
import { createCanvas, createContext, createSprite, HEIGHT, setRendererSize, solid, WIDTH } from "../helpers";

// Deterministic sprite layout, so the final frame hash is comparable between runs.
const random = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;

const HUES = ["#ff5c5c", "#57d985", "#58a6ff", "#ffd166", "#c77dff", "#4cc9f0", "#f72585", "#b5e48c"];

const createScene = (textures, count, maxRenderCount) => {
  const context = createContext();
  const stage = new Stage2D({ context, maxRenderCount });
  const next = random(count);
  setRendererSize(stage);
  stage.clearBeforeRender = true;
  stage.clearColor.set(0.025, 0.04, 0.065, 1);

  for (let i = 0; i < count; i++) {
    const size = 4 + next() * 12;
    stage.container.addChild(
      createSprite(textures[i % textures.length], next() * (WIDTH - size), next() * (HEIGHT - size), size, size),
    );
  }

  return { context, render: () => stage.render() };
};

const createLiveCanvas = () =>
  createCanvas(64, 64, (context, width, height) => {
    context.fillStyle = "#58a6ff";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffd166";
    context.fillRect(16, 16, 32, 32);
  });

// A playing, muted video of a static canvas; resolves once it has a frame. Playback belongs to the
// app using PWGL, so the case stops the video and its stream itself in `dispose`.
const createVideo = () => {
  const video = document.createElement("video");
  const stream = createLiveCanvas().captureStream();
  let disposed = false;
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  const ready = video
    .play()
    .then(() => new Promise((resolve) => (video.videoWidth ? resolve() : video.addEventListener("resize", resolve, { once: true }))))
    .catch((error) => {
      // Disposing interrupts play(); that is expected, not a failure.
      if (!disposed) throw error;
    });
  const dispose = () => {
    disposed = true;
    video.pause();
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
  return { video, ready, dispose };
};

const benchmarkCase = (id, title, expectation, create, options = {}) => ({
  id,
  group: "Benchmark",
  title,
  expectation,
  benchmark: options,
  create() {
    const instance = create();
    return {
      ...instance,
      async check(t) {
        await withTimeout(instance.ready, READY_TIMEOUT, "ready");
        await t.renders(2);
        const { maxLuminance } = t.region(0, 0, t.width, t.height, 4);
        t.check("frame is not blank", maxLuminance > 10, `max luminance ${maxLuminance.toFixed(0)}`);
        await t.expectStable();
      },
    };
  },
});

export const benchmarkCases = [
  benchmarkCase(
    "benchmark-sprites",
    "10k sprites, 4 textures",
    "10 000 small colored squares scattered over the canvas, drawn in five batches from four textures.",
    () => createScene(HUES.slice(0, 4).map((color) => new Texture(solid(color))), 10000, 2000),
  ),
  benchmarkCase(
    "benchmark-slot-churn",
    "4k sprites, more textures than slots",
    "4 000 small squares in eight colors from more textures than the GPU has texture units, so slots are cleared and reassigned.",
    () => {
      const count = Utils.INFO.maxTextureImageUnits + 4;
      const textures = Array.from({ length: count }, (_, index) => new Texture(solid(HUES[index % HUES.length])));
      return createScene(textures, 4000, 4000);
    },
  ),
  benchmarkCase(
    "benchmark-live-canvas",
    "Live canvas texture × 2k",
    "2 000 squares showing a blue canvas with a yellow center, uploaded from one shouldUpdate canvas texture.",
    () => createScene([new Texture(createLiveCanvas(), true)], 2000, 2000),
  ),
  benchmarkCase(
    "benchmark-video",
    "Playing video × 2k",
    "2 000 squares showing a blue frame with a yellow center from one playing video texture.",
    () => {
      const { video, ready, dispose } = createVideo();
      return { ...createScene([new Texture(video)], 2000, 2000), ready, dispose };
    },
    // Fewer frames: before the render-pass gate every sprite re-uploaded the video.
    { frames: 20, warmup: 2 },
  ),
];
