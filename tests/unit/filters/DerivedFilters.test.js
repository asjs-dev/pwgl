import { describe, expect, it } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadFilterModules = async () => {
  const [
    { BaseKernelFilter },
    { BlurFilter },
    { EdgeDetectFilter },
    { GlowFilter },
    { MaskFilter },
    { SharpenFilter },
    { TintFilter },
    { TintType },
  ] = await Promise.all([
    loadSrcModuleWithBrowserMocks("../../../src/filters/BaseKernelFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/BlurFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/EdgeDetectFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/GlowFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/MaskFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/SharpenFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/TintFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/rendering/TintType.js"),
  ]);

  return {
    BaseKernelFilter,
    BlurFilter,
    EdgeDetectFilter,
    GlowFilter,
    MaskFilter,
    SharpenFilter,
    TintFilter,
    TintType,
  };
};

describe("derived filters", () => {
  it("exposes the base kernel GLSL code", async () => {
    const { BaseKernelFilter } = await loadFilterModules();
    const filter = new BaseKernelFilter();

    expect(filter.GLSL).toContain("mat3 kr=uK*v;");
    expect(filter.GLSL).toContain("texelFetch");
  });

  it("creates built-in edge detect kernels", async () => {
    const { EdgeDetectFilter } = await loadFilterModules();
    const filter = new EdgeDetectFilter();

    expect(Array.from(filter.kernels)).toEqual([-1, -1, -1, -1, 8, -1, -1, -1, -1]);
  });

  it("creates built-in sharpen kernels", async () => {
    const { SharpenFilter } = await loadFilterModules();
    const filter = new SharpenFilter();

    expect(Array.from(filter.kernels)).toEqual([0, -1, 0, -1, 5, -1, 0, -1, 0]);
  });

  it("stores extra glow settings in customData", async () => {
    const { GlowFilter } = await loadFilterModules();
    const filter = new GlowFilter({ threshold: 0.6, knee: 0.2, bloom: 0.8 });

    expect(filter.threshold).toBeCloseTo(0.6);
    expect(filter.knee).toBeCloseTo(0.2);
    expect(filter.bloom).toBeCloseTo(0.8);
    expect(filter.GLSL).toContain("tmpCl.rgb+oCl.rgb*b*uL[0].z");
  });

  it("stores tint color channels and type", async () => {
    const { TintFilter, TintType } = await loadFilterModules();
    const filter = new TintFilter({
      r: 0.2,
      g: 0.4,
      b: 0.6,
      a: 0.8,
      type: TintType.ADD,
    });

    expect(filter.r).toBeCloseTo(0.2);
    expect(filter.g).toBeCloseTo(0.4);
    expect(filter.b).toBeCloseTo(0.6);
    expect(filter.a).toBeCloseTo(0.8);
    expect(filter.type).toBe(TintType.ADD);
    expect(filter.GLSL).toContain("uL[1].x");
  });

  it("stores mask filter channel type", async () => {
    const { MaskFilter } = await loadFilterModules();
    const filter = new MaskFilter({ type: MaskFilter.Type.ALPHA });

    expect(filter.type).toBe(MaskFilter.Type.ALPHA);
    expect(filter.GLSL).toContain("oCl.a*=");
  });

  it("exposes sampling GLSL in blur-based filters", async () => {
    const { BlurFilter } = await loadFilterModules();
    const filter = new BlurFilter();

    expect(filter.GLSL).toContain("if(v>0.)");
    expect(filter.GLSL).toContain("oCl*=.2;");
  });
});

const loadCoreFilterModules = async () => {
  const [
    { ColorLUTFilter },
    { FilmGrainFilter },
    { FXAAFilter },
    { ScanlineFilter },
    { ThresholdFilter },
    { ToneMapFilter },
    { ToneMapType },
  ] = await Promise.all([
    loadSrcModuleWithBrowserMocks("../../../src/filters/ColorLUTFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/FilmGrainFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/FXAAFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/ScanlineFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/ThresholdFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/filters/ToneMapFilter.js"),
    loadSrcModuleWithBrowserMocks("../../../src/rendering/ToneMapType.js"),
  ]);

  return { ColorLUTFilter, FilmGrainFilter, FXAAFilter, ScanlineFilter, ThresholdFilter, ToneMapFilter, ToneMapType };
};

// [class name, intensity default, { property: [customData index, default, custom value] }]
const CORE_FILTER_LAYOUTS = [
  ["ToneMapFilter", 1, { type: [0, 1, 0] }],
  ["ColorLUTFilter", 1, { lutSize: [0, 16, 32] }],
  ["FXAAFilter", 1, { spanMax: [0, 8, 4], reduceMul: [1, 1 / 8, 0.25], reduceMin: [2, 1 / 128, 0.0625] }],
  [
    "ThresholdFilter",
    0.5,
    {
      lowR: [0, 0, 0.25],
      lowG: [1, 0, 0.5],
      lowB: [2, 0, 0.75],
      highR: [3, 1, 0.5],
      highG: [4, 1, 0.25],
      highB: [5, 1, 0.125],
      smoothness: [6, 0, 0.2],
    },
  ],
  ["FilmGrainFilter", 0.1, { seed: [0, 1, 7], fps: [1, 24, 0], grainSize: [2, 1, 3] }],
  ["ScanlineFilter", 0.3, { spacing: [0, 2, 4], curvature: [1, 0, 0.5], vignette: [2, 0, 0.75] }],
];

describe("core post-processing filters", () => {
  it("exposes the tone map operators", async () => {
    const { ToneMapType } = await loadCoreFilterModules();

    expect(ToneMapType).toEqual({ REINHARD: 0, ACES: 1 });
  });

  it.each(CORE_FILTER_LAYOUTS)("%s uses the documented defaults", async (name, intensity, layout) => {
    const modules = await loadCoreFilterModules();
    const filter = new modules[name]();

    expect(filter.intensity).toBeCloseTo(intensity);
    for (const [property, [index, value]] of Object.entries(layout)) {
      expect(filter[property], property).toBeCloseTo(value);
      expect(filter.customData[index], property).toBeCloseTo(value);
    }
  });

  it.each(CORE_FILTER_LAYOUTS)("%s maps options and setters to customData", async (name, _, layout) => {
    const modules = await loadCoreFilterModules();
    const options = Object.fromEntries(Object.entries(layout).map(([property, [, , value]]) => [property, value]));
    const fromOptions = new modules[name]({ intensity: 2, ...options });
    const fromSetters = new modules[name]();

    expect(fromOptions.intensity).toBe(2);
    for (const [property, [index, , value]] of Object.entries(layout)) {
      fromSetters[property] = value;
      expect(fromOptions.customData[index], property).toBeCloseTo(value);
      expect(fromSetters.customData[index], property).toBeCloseTo(value);
    }
  });

  it.each(CORE_FILTER_LAYOUTS)("%s returns the same GLSL for different parameters", async (name, _, layout) => {
    const modules = await loadCoreFilterModules();
    const options = Object.fromEntries(Object.entries(layout).map(([property, [, , value]]) => [property, value]));

    expect(new modules[name]({ intensity: 3, ...options }).GLSL).toBe(new modules[name]().GLSL);
  });

  it("keeps the LUT texture on the filter", async () => {
    const { ColorLUTFilter } = await loadCoreFilterModules();
    const texture = { id: "lut" };

    expect(new ColorLUTFilter({ texture }).texture).toBe(texture);
  });
});
