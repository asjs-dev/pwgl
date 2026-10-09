import * as PWGL from "../../../src/exports";
import { createCanvas, createSmallContext, createSmallStage, createSprite, SMALL_HEIGHT, SMALL_WIDTH, testCard } from "../helpers";

const { BlurFilter, BrightnessFilter, FilterRenderer, Framebuffer, GlowFilter, SaturateFilter, Texture } = PWGL;

const maskTexture = () =>
  new Texture(
    createCanvas(16, 16, (context) => {
      context.fillStyle = "#ff0000";
      context.fillRect(0, 0, 8, 16);
    }),
  );

const noiseTexture = () =>
  new Texture(
    createCanvas(32, 32, (context) => {
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 32; j++) {
          const v = Math.floor((Math.sin(i * 1.7 + j * 2.3) * 0.5 + 0.5) * 255);
          context.fillStyle = `rgb(${v},${255 - v},128)`;
          context.fillRect(i, j, 1, 1);
        }
      }
    }),
  );

// [title, filter class name, options, filter-specific check (t, unfiltered frame)]
const FILTERS = [
  ["Invert", "InvertFilter", {}, (t) => t.expectPx("red bar inverts to cyan", 8, 36, [0, 255, 255, 255], 40)],
  [
    "Grayscale",
    "GrayscaleFilter",
    {},
    (t) => {
      const p = t.px(8, 36);
      t.check("red bar becomes grey (r≈g≈b)", Math.abs(p[0] - p[1]) < 12 && Math.abs(p[1] - p[2]) < 12, t.formatPixel(p));
    },
  ],
  [
    "Sepia",
    "SepiaFilter",
    {},
    (t) => {
      const p = t.px(224, 36);
      t.check("grey turns warm (r>g>b)", p[0] > p[1] && p[1] > p[2], t.formatPixel(p));
    },
  ],
  [
    "Brightness",
    "BrightnessFilter",
    { intensity: 1.5 },
    (t, reference) => {
      const before = t.luminance(reference.px(224, 36));
      const after = t.luminance(t.px(224, 36));
      t.check("grey gets brighter", after > before + 10, `${before.toFixed(0)} → ${after.toFixed(0)}`);
    },
  ],
  ["Contrast", "ContrastFilter", { intensity: 1.6 }],
  ["Saturate", "SaturateFilter", { intensity: 2 }],
  [
    "Hue rotate",
    "HueRotateFilter",
    { intensity: 90 },
    (t) => {
      const p = t.px(8, 36);
      t.check("red bar changes hue", !t.near(p, [255, 0, 0, 255], 40), t.formatPixel(p));
    },
  ],
  ["Gamma", "GammaFilter", { intensity: 2 }],
  ["Posterize", "PosterizeFilter", { intensity: 4 }],
  [
    "Pixelate",
    "PixelateFilter",
    { intensity: 16 },
    (t) => {
      const a = t.px(130, 70);
      const b = t.px(132, 72);
      t.check("neighbouring pixels in one block match", t.near(a, b, 6), `${t.formatPixel(a)} vs ${t.formatPixel(b)}`);
    },
  ],
  [
    "Blur",
    "BlurFilter",
    { intensity: 4 },
    (t, reference) => {
      const edge = (px) => Math.abs(t.luminance(px(30, 72)) - t.luminance(px(34, 72)));
      const before = edge(reference.px);
      const after = edge(t.px);
      t.check("edge between bars softens", after < before, `${before.toFixed(0)} → ${after.toFixed(0)}`);
    },
  ],
  ["Sharpen", "SharpenFilter", { intensity: 1 }],
  [
    "Edge detect",
    "EdgeDetectFilter",
    { intensity: 1 },
    (t) => {
      const flat = t.luminance(t.px(8, 72));
      t.check("flat area becomes dark", flat < 60, `luminance ${flat.toFixed(0)}`);
    },
  ],
  ["Glow", "GlowFilter", { intensity: 2, threshold: 0.5, bloom: 0.05 }],
  ["Chromatic aberration", "ChromaticAberrationFilter", { intensity: 4 }],
  ["Rainbow", "RainbowFilter", { intensity: 1 }],
  [
    "Tint",
    "TintFilter",
    { r: 1, g: 0, b: 0, a: 1 },
    (t) => {
      const p = t.px(224, 36);
      t.check("multiply by red removes green and blue", p[1] < 30 && p[2] < 30, t.formatPixel(p));
    },
  ],
  [
    "Mask",
    "MaskFilter",
    { texture: maskTexture },
    (t) => {
      const left = t.px(30, 72);
      const right = t.px(226, 72);
      t.check("left half kept, right half masked out", left[3] > 200 && right[3] < 60, `alpha ${left[3]} / ${right[3]}`);
    },
  ],
  ["Displacement", "DisplacementFilter", { texture: noiseTexture, intensity: 20 }],
];

const createFilterCase = ([name, className, options, verify]) => ({
  id: `filter-${className}`,
  group: "Filters",
  title: `${name} filter`,
  expectation: `Test card (RGBY bars and a grey ramp) rendered to a framebuffer, then through FilterRenderer with ${className}. Output must differ from the unfiltered frame${verify ? " and pass the filter-specific check" : ""}.`,
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    stage.container.addChild(createSprite(new Texture(testCard()), 0, 0, SMALL_WIDTH, SMALL_HEIGHT));
    const source = new Framebuffer();
    const filter = new PWGL[className]({ ...options, texture: options.texture?.() });
    const filters = new FilterRenderer({ context, sourceTexture: source, filters: [filter] });
    filters.setSize(SMALL_WIDTH, SMALL_HEIGHT);
    filters.clearBeforeRender = true;
    filters.clearColor.set(0, 0, 0, 0);
    const render = () => {
      stage.renderToFramebuffer(source);
      filters.render();
    };

    return {
      context,
      render,
      async check(t) {
        filter.on = false;
        await t.renders(2);
        const reference = t.snapshot();
        filter.on = true;
        await t.renders(2);
        const changed = t.diffCount(reference);
        const { maxLuminance } = t.region(0, 0, SMALL_WIDTH, SMALL_HEIGHT);
        t.check("output differs from source", changed > 200, `${changed} px changed`);
        t.check("output is not blank", maxLuminance > 20, `max luminance ${maxLuminance.toFixed(0)}`);
        verify?.(t, reference);
        await t.expectStable();
      },
    };
  },
});

export const filterChain = {
  id: "filter-chain",
  group: "Filters",
  title: "Filter chain ping-pong",
  expectation: "Brightness, Blur, Saturate and Glow chained on one FilterRenderer. The result must be non-blank and identical across repeated frames.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    stage.container.addChild(createSprite(new Texture(testCard()), 0, 0, SMALL_WIDTH, SMALL_HEIGHT));
    const source = new Framebuffer();
    const filters = new FilterRenderer({
      context,
      sourceTexture: source,
      filters: [
        new BrightnessFilter({ intensity: 1.1 }),
        new BlurFilter({ intensity: 2 }),
        new SaturateFilter({ intensity: 1.5 }),
        new GlowFilter({ intensity: 1, threshold: 0.6, bloom: 0.03 }),
      ],
    });
    filters.setSize(SMALL_WIDTH, SMALL_HEIGHT);

    return {
      context,
      render() {
        stage.renderToFramebuffer(source);
        filters.render();
      },
      async check(t) {
        await t.renders(3);
        const { maxLuminance } = t.region(0, 0, SMALL_WIDTH, SMALL_HEIGHT);
        t.check("output is not blank", maxLuminance > 40, `max luminance ${maxLuminance.toFixed(0)}`);
        await t.expectStable();
        await t.expectStable("stable after 5 more frames", 5);
      },
    };
  },
};

export const filterCases = [...FILTERS.map(createFilterCase), filterChain];
