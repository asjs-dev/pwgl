import * as PWGL from "../../../src/exports";
import { createCanvas, createSmallContext, createSmallStage, createSprite, SMALL_HEIGHT, SMALL_WIDTH, testCard } from "../helpers";

const {
  BlurFilter,
  BrightnessFilter,
  ColorLUTFilter,
  FilterRenderer,
  FXAAFilter,
  Framebuffer,
  GlowFilter,
  SaturateFilter,
  Texture,
  ThresholdFilter,
  ToneMapFilter,
} = PWGL;

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

// ColorLUTFilter strip of 16 slices of 16 x 16 (256 x 16); `map` turns the slice rgb (0-1) into the output rgb.
const lutTexture = (map) => () =>
  new Texture(
    createCanvas(256, 16, (context, width, height) => {
      const imageData = context.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const rgb = map([(x % 16) / 15, y / 15, Math.floor(x / 16) / 15]).map((value) => Math.round(value * 255));
          imageData.data.set([...rgb, 255], (y * width + x) * 4);
        }
      }
      context.putImageData(imageData, 0, 0);
    }),
  );

const identityLut = lutTexture((rgb) => rgb);
const swapRedBlueLut = lutTexture(([r, g, b]) => [b, g, r]);

const maxChannelDiff = (a, b) => {
  let max = 0;
  for (let i = 0; i < a.data.length; i++) max = Math.max(max, Math.abs(a.data[i] - b.data[i]));
  return max;
};

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
  [
    "Tone map",
    "ToneMapFilter",
    { intensity: 2 },
    (t) => {
      const ramp = [140, 180, 240].map((x) => t.luminance(t.px(x, 72)));
      t.check("grey ramp stays monotonic", ramp[0] < ramp[1] && ramp[1] < ramp[2], ramp.map((v) => v.toFixed(0)).join(" < "));
      const p = t.px(8, 36);
      t.check("red bar stays red", p[0] > 150 && p[1] < 80 && p[2] < 80, t.formatPixel(p));
    },
  ],
  [
    "Color LUT",
    "ColorLUTFilter",
    { texture: swapRedBlueLut },
    (t) => {
      t.expectPx("red bar maps to blue", 8, 36, [0, 0, 255, 255], 40);
      t.expectPx("blue bar maps to red", 72, 36, [255, 0, 0, 255], 40);
      t.expectPx("green bar stays green", 40, 36, [0, 255, 0, 255], 40);
    },
  ],
  [
    "Threshold",
    "ThresholdFilter",
    { intensity: 0.5 },
    (t) => {
      t.expectPx("dark ramp end becomes low color", 140, 72, [0, 0, 0, 255], 30);
      t.expectPx("bright ramp end becomes high color", 250, 72, [255, 255, 255, 255], 30);
    },
  ],
  // fps 0 makes the grain time-independent, so the stability check below covers it.
  ["Film grain", "FilmGrainFilter", { intensity: 0.3, fps: 0 }],
  [
    "Scanline",
    "ScanlineFilter",
    { intensity: 0.5, spacing: 4 },
    (t) => {
      const rows = [36, 37, 38, 39].map((y) => t.luminance(t.px(224, y)));
      const spread = Math.max(...rows) - Math.min(...rows);
      t.check("rows inside one line period differ", spread > 10, rows.map((v) => v.toFixed(0)).join(", "));
      const p = t.px(1, 1);
      t.check("no curvature keeps the corner", p[3] > 200, t.formatPixel(p));
    },
  ],
  [
    "Scanline CRT",
    "ScanlineFilter",
    { intensity: 0.3, curvature: 0.5, vignette: 0.5 },
    (t) => {
      t.expectPx("corner outside the warped area is transparent", 1, 1, [0, 0, 0, 0], 4);
      const center = t.px(128, 72);
      t.check("center is kept", center[3] > 200 && t.luminance(center) > 20, t.formatPixel(center));
    },
    "filter-ScanlineFilter-crt",
  ],
];

const createFilterCase = ([name, className, options, verify, id = `filter-${className}`]) => ({
  id,
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

export const fxaaFilter = {
  id: "filter-FXAAFilter",
  group: "Filters",
  title: "FXAA filter",
  expectation:
    "A rotated white square on a dark background (no MSAA), then FXAAFilter. Only pixels along the jagged diagonal edges change; flat areas stay as they are.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 1 });
    const square = createSprite(new Texture(createCanvas(8, 8, (c) => ((c.fillStyle = "#fff"), c.fillRect(0, 0, 8, 8)))), 88, 32, 80, 80);
    square.transform.rotation = 0.3;
    stage.container.addChild(square);
    const source = new Framebuffer();
    const filter = new FXAAFilter();
    const filters = new FilterRenderer({ context, sourceTexture: source, filters: [filter] });
    filters.setSize(SMALL_WIDTH, SMALL_HEIGHT);

    return {
      context,
      render() {
        stage.renderToFramebuffer(source);
        filters.render();
      },
      async check(t) {
        filter.on = false;
        await t.renders(2);
        const reference = t.snapshot();
        filter.on = true;
        await t.renders(2);
        const changed = t.diffCount(reference);
        t.check("diagonal edges are smoothed", changed > 40, `${changed} px changed`);
        t.check("flat areas are kept", changed < 2000, `${changed} px changed`);
        t.expectPx("square center stays white", 114, 82, [255, 255, 255, 255], 6);
        t.expectPx("background stays dark", 8, 8, reference.px(8, 8), 6);
        await t.expectStable();
      },
    };
  },
};

// Semi-transparent sprite on a transparent background: the framebuffer holds premultiplied color.
export const premultipliedFilters = {
  id: "filter-premultiplied-alpha",
  group: "Filters",
  title: "Color filters on premultiplied alpha",
  expectation:
    "The test card at alpha 0.5 on a transparent background, then ToneMap, Threshold and an identity ColorLUT one by one. Alpha must stay unchanged, and the identity LUT must reproduce the input without darkening.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    stage.clearColor.set(0, 0, 0, 0);
    const card = createSprite(new Texture(testCard()), 0, 0, SMALL_WIDTH, SMALL_HEIGHT);
    card.alpha = 0.5;
    stage.container.addChild(card);
    const source = new Framebuffer();
    const toneMap = new ToneMapFilter({ intensity: 2 });
    const threshold = new ThresholdFilter();
    const lut = new ColorLUTFilter({ texture: identityLut() });
    const all = [toneMap, threshold, lut];
    const filters = new FilterRenderer({ context, sourceTexture: source, filters: all });
    filters.setSize(SMALL_WIDTH, SMALL_HEIGHT);
    filters.clearBeforeRender = true;
    filters.clearColor.set(0, 0, 0, 0);
    const only = (filter) => all.forEach((item) => (item.on = item === filter));

    return {
      context,
      render() {
        stage.renderToFramebuffer(source);
        filters.render();
      },
      async check(t) {
        only(null);
        await t.renders(2);
        const reference = t.snapshot();
        const alpha = reference.px(40, 72)[3];
        t.check("source is semi-transparent", alpha > 100 && alpha < 160, `alpha ${alpha}`);
        for (const [name, filter] of [["ToneMap", toneMap], ["Threshold", threshold], ["ColorLUT", lut]]) {
          only(filter);
          await t.renders(2);
          const probes = [8, 40, 72, 104, 160, 224].map((x) => [`${name} x=${x}`, x, 72, [...t.px(x, 72).slice(0, 3), reference.px(x, 72)[3]]]);
          t.expectPxAll(`${name} alpha values`, probes, 2);
        }
        only(lut);
        await t.renders(2);
        const diff = maxChannelDiff(reference.frame, t.snapshot().frame);
        t.check("identity LUT reproduces the input", diff <= 1, `max channel diff ${diff}`);
      },
    };
  },
};

export const filterCases = [...FILTERS.map(createFilterCase), fxaaFilter, premultipliedFilters, filterChain];
