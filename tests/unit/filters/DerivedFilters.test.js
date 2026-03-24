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
