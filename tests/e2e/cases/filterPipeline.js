import {
  BlurFilter,
  BrightnessFilter,
  ColorLUTFilter,
  FilmGrainFilter,
  FilterRenderer,
  FXAAFilter,
  Framebuffer,
  ScanlineFilter,
  Stage2D,
  Texture,
  ThresholdFilter,
  ToneMapFilter,
  ToneMapType,
} from "../../../src/exports";
import { createAtlas, createCanvas, createContext, createImage, setRendererSize } from "../helpers";

export const filterPipeline = {
  id: "filter-pipeline",
  group: "Filters",
  title: "Framebuffer filter ping-pong",
  expectation:
    "A softly blurred bright 5×3 tile grid. No black frame, stale framebuffer, missing tile or alternating output is valid.",
  create() {
    const context = createContext();
    const stage = new Stage2D({ context, maxRenderCount: 5 });
    const source = new Framebuffer();
    const filters = new FilterRenderer({
      context,
      sourceTexture: source,
      filters: [new BrightnessFilter({ intensity: 1.15 }), new BlurFilter({ intensity: 1.25 })],
    });
    const texture = createAtlas();
    setRendererSize(stage);
    setRendererSize(filters);
    stage.clearBeforeRender = true;
    stage.clearColor.set(0.02, 0.025, 0.04, 1);

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 5; column++) {
        stage.container.addChild(createImage(texture, 62 + column * 112, 46 + row * 104, (row + column) & 3, 96));
      }
    }

    return {
      context,
      render() {
        // stage.render();
        stage.renderToFramebuffer(source);
        filters.render();
      },
    };
  },
};

// Identity ColorLUTFilter strip: 16 slices of 16 x 16 (256 x 16), opaque.
const identityLut = () =>
  new Texture(
    createCanvas(256, 16, (context, width, height) => {
      const imageData = context.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          imageData.data.set(
            [((x % 16) * 255) / 15, (y * 255) / 15, (Math.floor(x / 16) * 255) / 15, 255],
            (y * width + x) * 4,
          );
        }
      }
      context.putImageData(imageData, 0, 0);
    }),
  );

export const coreFilterChain = {
  id: "core-filter-chain",
  group: "Filters",
  title: "Core post-processing filter chain",
  expectation:
    "A 5×3 tile grid, tone mapped, thresholded to dark blue / warm white, with static grain, scanlines and a curved CRT rim (transparent outside). No GL error, black frame or flicker between frames is valid.",
  create() {
    const context = createContext();
    const stage = new Stage2D({ context, maxRenderCount: 5 });
    const source = new Framebuffer();
    const filters = new FilterRenderer({
      context,
      sourceTexture: source,
      filters: [
        new ToneMapFilter({ intensity: 1.5, type: ToneMapType.ACES }),
        new ColorLUTFilter({ texture: identityLut() }),
        new FXAAFilter(),
        new ThresholdFilter({ intensity: 0.4, lowB: 0.3, highB: 0.7, smoothness: 0.2 }),
        new FilmGrainFilter({ intensity: 0.15, fps: 0, grainSize: 2 }),
        new ScanlineFilter({ intensity: 0.35, spacing: 3, curvature: 0.3, vignette: 0.5 }),
      ],
    });
    const texture = createAtlas();
    setRendererSize(stage);
    setRendererSize(filters);
    stage.clearBeforeRender = true;
    stage.clearColor.set(0.02, 0.025, 0.04, 1);

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 5; column++) {
        stage.container.addChild(createImage(texture, 62 + column * 112, 46 + row * 104, (row + column) & 3, 96));
      }
    }

    return {
      context,
      render() {
        stage.renderToFramebuffer(source);
        filters.render();
      },
      async check(t) {
        await t.renders(2);
        const { maxLuminance } = t.region(0, 0, t.width, t.height, 4);
        t.check("frame is not blank", maxLuminance > 20, `max luminance ${maxLuminance.toFixed(0)}`);
        t.expectPx("CRT corner is transparent", 1, 1, [0, 0, 0, 0], 4);
        await t.expectStable();
      },
    };
  },
};
