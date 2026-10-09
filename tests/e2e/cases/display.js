import { AnimatedImage, Text, Texture } from "../../../src/exports";
import {
  BACKGROUND,
  createCanvas,
  createSmallContext,
  createSmallStage,
  createSprite,
  quadrants,
  rgba,
  SMALL_HEIGHT,
  SMALL_WIDTH,
  solid,
} from "../helpers";
import { sleep } from "../checks";

const RGBY = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];

export const text = {
  id: "text",
  group: "Display",
  title: "Text",
  expectation: "White text \"PWGL 0123\" rendered from a canvas texture. Text pixels must exist in the text band and nowhere below it.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    const label = new Text("PWGL 0123", { fontSize: 44, fontColor: "#ffffff", fontFamily: "Arial, sans-serif", align: "center" });
    label.transform.y = 30;
    label.transform.width = SMALL_WIDTH;
    label.transform.height = 60;
    stage.container.addChild(label);

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(3);
        const band = t.region(0, 30, SMALL_WIDTH, 60);
        const below = t.region(0, 100, SMALL_WIDTH, 44);
        t.check("text band has bright pixels", band.maxLuminance > 200, `max luminance ${band.maxLuminance.toFixed(0)}`);
        t.check("area below text is empty", below.maxLuminance < 40, `max luminance ${below.maxLuminance.toFixed(0)}`);
      },
    };
  },
};

export const animatedImage = {
  id: "animated-image",
  group: "Display",
  title: "Animated image frames",
  expectation: "An AnimatedImage stepping through four atlas frames with gotoAndStop. Each step must show its own frame color.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    const image = new AnimatedImage(new Texture(quadrants(RGBY)));
    image.transform.x = 64;
    image.transform.y = 24;
    image.transform.width = 128;
    image.transform.height = 96;
    image.frames = [0, 1, 2, 3].map((i) => {
      const x = (i & 1) * 0.5;
      const y = (i >> 1) * 0.5;
      return { x, y, width: x + 0.5, height: y + 0.5 };
    });
    stage.container.addChild(image);

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        for (let i = 0; i < 4; i++) {
          image.gotoAndStop(i);
          await t.renders(1);
          t.expectPx(`frame ${i}`, 128, 72, rgba(RGBY[i]));
        }
      },
    };
  },
};

export const textureSourceSwap = {
  id: "texture-source-swap",
  group: "Textures",
  title: "Texture source swap",
  expectation: "A texture switches its source canvas from red to blue, then a live canvas texture (shouldUpdate) is redrawn green then yellow.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    const swapped = new Texture(solid("#ff0000"));
    const live = createCanvas(8, 8, (canvasContext) => {
      canvasContext.fillStyle = "#00ff00";
      canvasContext.fillRect(0, 0, 8, 8);
    });
    stage.container.addChild(createSprite(swapped, 0, 0, 128, SMALL_HEIGHT));
    stage.container.addChild(createSprite(new Texture(live, true), 128, 0, 128, SMALL_HEIGHT));

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(1);
        t.expectPx("initial red", 64, 72, [255, 0, 0, 255]);
        swapped.source = solid("#0000ff");
        await t.renders(1);
        t.expectPx("after swap blue", 64, 72, [0, 0, 255, 255]);
        t.expectPx("live canvas green", 192, 72, [0, 255, 0, 255]);
        const canvasContext = live.getContext("2d");
        canvasContext.fillStyle = "#ffff00";
        canvasContext.fillRect(0, 0, 8, 8);
        // Live textures re-upload once per render time, which is in milliseconds.
        await sleep(20);
        await t.renders(1);
        t.expectPx("live canvas redrawn yellow", 192, 72, [255, 255, 0, 255]);
      },
    };
  },
};

export const runtimeResize = {
  id: "runtime-resize",
  group: "Textures",
  title: "Resize at runtime",
  expectation: "Canvas and renderer shrink to half size and grow back. The image must keep covering the same relative area after each resize.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    const image = createSprite(new Texture(solid("#00ffff")), 0, 0, SMALL_WIDTH / 2, SMALL_HEIGHT / 2);
    stage.container.addChild(image);
    const resize = (scale) => {
      context.setCanvasSize(SMALL_WIDTH * scale, SMALL_HEIGHT * scale);
      stage.setSize(SMALL_WIDTH * scale, SMALL_HEIGHT * scale);
      image.transform.width = (SMALL_WIDTH / 2) * scale;
      image.transform.height = (SMALL_HEIGHT / 2) * scale;
    };

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(1);
        t.expectPx("full size: inside", 60, 30, [0, 255, 255, 255]);
        resize(0.5);
        await t.renders(1);
        t.check("half size: canvas resized", t.width === SMALL_WIDTH / 2, `canvas ${t.width}×${t.height}`);
        t.expectPx("half size: inside", 30, 15, [0, 255, 255, 255]);
        resize(1);
        await t.renders(1);
        t.expectPx("restored: inside", 60, 30, [0, 255, 255, 255]);
        t.expectPx("restored: outside", 200, 110, BACKGROUND);
      },
    };
  },
};

export const pointerHitTest = {
  id: "pointer-hit-test",
  group: "Input",
  title: "Pointer hit-test",
  expectation:
    "An interactive image receives synthetic pointer events. A press on the image must reach onPointerDown; a press on empty space must not.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2, useInteraction: true });
    const image = createSprite(new Texture(solid("#ff00ff")), 96, 40, 64, 64);
    image.interactive = true;
    const counts = { down: 0, over: 0 };
    image.onPointerDown = () => counts.down++;
    image.onPointerOver = () => counts.over++;
    stage.container.addChild(image);

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(1);
        const fire = (type, x, y) => {
          const rect = context.canvas.getBoundingClientRect();
          context.canvas.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              clientX: rect.left + (x / SMALL_WIDTH) * rect.width,
              clientY: rect.top + (y / SMALL_HEIGHT) * rect.height,
              button: 0,
            }),
          );
        };
        fire("mousemove", 128, 72);
        await t.renders(1);
        fire("mousedown", 128, 72);
        await t.renders(1);
        t.check("press on image fires onPointerDown", counts.down === 1, `downs=${counts.down}`);
        t.check("hover fires onPointerOver", counts.over >= 1, `overs=${counts.over}`);
        fire("mousedown", 20, 20);
        await t.renders(1);
        t.check("press outside is ignored", counts.down === 1, `downs=${counts.down}`);
      },
    };
  },
};

export const displayCases = [text, animatedImage, textureSourceSwap, runtimeResize, pointerHitTest];
