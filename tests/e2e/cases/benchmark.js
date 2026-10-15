import { Container, Framebuffer, Light, LightRenderer, Stage2D, Text, Texture, Utils } from "../../../src/exports";
import { READY_TIMEOUT, withTimeout } from "../checks";
import { createCanvas, createContext, createSprite, HEIGHT, setRendererSize, solid, WIDTH } from "../helpers";

// Deterministic sprite layout, so the final frame hash is comparable between runs.
const random = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;

const HUES = ["#ff5c5c", "#57d985", "#58a6ff", "#ffd166", "#c77dff", "#4cc9f0", "#f72585", "#b5e48c"];

const createStage = (maxRenderCount) => {
  const context = createContext();
  const stage = new Stage2D({ context, maxRenderCount });
  setRendererSize(stage);
  stage.clearBeforeRender = true;
  stage.clearColor.set(0.025, 0.04, 0.065, 1);
  return { context, stage };
};

const addRandomSprite = (container, texture, next) => {
  const size = 4 + next() * 12;
  container.addChild(createSprite(texture, next() * (WIDTH - size), next() * (HEIGHT - size), size, size));
};

const createScene = (textures, count, maxRenderCount) => {
  const { context, stage } = createStage(maxRenderCount);
  const next = random(count);

  for (let i = 0; i < count; i++) addRandomSprite(stage.container, textures[i % textures.length], next);

  return { context, render: () => stage.render() };
};

// Chains of nested containers with sprites on every level; intermediate levels fade the alpha and
// some disable the tint, so every sprite depends on its whole ancestor chain.
const createDeepScene = (textures, chains, depth, spritesPerLevel, maxRenderCount) => {
  const { context, stage } = createStage(maxRenderCount);
  const next = random(chains * depth * spritesPerLevel);

  for (let chain = 0; chain < chains; chain++) {
    let parent = stage.container;
    for (let level = 0; level < depth; level++) {
      const container = new Container();
      container.alpha = 0.92;
      container.useTint = (chain + level) % 5 !== 0;
      parent.addChild(container);
      for (let i = 0; i < spritesPerLevel; i++) addRandomSprite(container, textures[(chain + i) % textures.length], next);
      parent = container;
    }
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

// A flat floor lit by `count` point lights without shadows or a normal map; the GPU side stays cheap,
// so the per-light CPU work (update and buffer fill) dominates.
const createLightBenchScene = (count, radius) => {
  const context = createContext();
  const sceneFramebuffer = new Framebuffer();
  // The light shader always samples the height map; an empty one keeps the floor at height 0.
  const heightFramebuffer = new Framebuffer();
  const light = new LightRenderer({
    context,
    maxRenderCount: count,
    sourceTexture: sceneFramebuffer,
    heightMap: heightFramebuffer,
  });
  const stage = new Stage2D({ context, maxRenderCount: 64, lightRenderer: light });
  const heights = new Stage2D({ context, maxRenderCount: 1 });
  setRendererSize(stage);
  setRendererSize(heights);
  heights.clearBeforeRender = true;
  heights.clearColor.set(0, 0, 0, 1);
  light.setSize(WIDTH, HEIGHT);
  const next = random(count);
  stage.container.addChild(createSprite(new Texture(solid("#9a9a9a")), 0, 0, WIDTH, HEIGHT));
  for (let i = 0; i < count; i++) {
    const item = new Light();
    item.transform.x = next() * WIDTH;
    item.transform.y = next() * HEIGHT;
    item.transform.z = radius / 2;
    item.transform.width = radius;
    item.color.set(0.3 + next() * 0.7, 0.6, 1 - next() * 0.7, 0.4);
    item.castShadow = false;
    stage.container.addChild(item);
  }
  return {
    context,
    render() {
      stage.renderToFramebuffer(sceneFramebuffer);
      heights.renderToFramebuffer(heightFramebuffer);
      light.render();
    },
  };
};

// A grid of static labels whose own and parent positions are rewritten every frame; the setters mark
// the transforms updated even for the same value, so the rendered frame stays identical.
const createTextBenchScene = (columns, rows) => {
  const { context, stage } = createStage(columns * rows);
  const group = new Container();
  const labels = [];
  const width = WIDTH / columns;
  const height = HEIGHT / rows;
  stage.container.addChild(group);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column;
      const label = new Text(`Label ${index}`, { fontSize: 12, fontColor: HUES[index % HUES.length], fontFamily: "Arial, sans-serif" });
      label.transform.x = column * width;
      label.transform.y = row * height;
      label.transform.width = width;
      label.transform.height = height;
      group.addChild(label);
      labels.push(label);
    }
  }
  return {
    context,
    render() {
      group.transform.x = 0;
      for (let i = 0, l = labels.length; i < l; i++) labels[i].transform.x = (i % columns) * width;
      stage.render();
    },
  };
};

export const benchmarkCases = [
  benchmarkCase(
    "benchmark-sprites",
    "10k sprites, 4 textures",
    "10 000 small colored squares scattered over the canvas, drawn in five batches from four textures.",
    () => createScene(HUES.slice(0, 4).map((color) => new Texture(solid(color))), 10000, 2000),
  ),
  benchmarkCase(
    "benchmark-deep-tree",
    "10k sprites in 8-level containers",
    "10 240 small colored squares fading with depth, held by 40 chains of 8 nested containers with alpha and tint set on every level.",
    () => createDeepScene(HUES.slice(0, 4).map((color) => new Texture(solid(color))), 40, 8, 32, 2000),
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
  benchmarkCase(
    "benchmark-lights-400",
    "400 lights",
    "A gray floor lit by 400 colored point lights.",
    () => createLightBenchScene(400, 40),
  ),
  benchmarkCase(
    "benchmark-lights-4k",
    "4k small lights",
    "A gray floor lit by 4 000 small colored point lights.",
    () => createLightBenchScene(4000, 4),
  ),
  benchmarkCase(
    "benchmark-text",
    "Moving text × 200",
    "A grid of 200 static colored \"Label n\" texts whose positions are rewritten every frame.",
    () => createTextBenchScene(10, 20),
  ),
];
