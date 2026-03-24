import { describe, expect, it } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadBaseTextureFilterModule = () => loadSrcModuleWithBrowserMocks("../../../src/filters/BaseTextureFilter.js");

describe("BaseTextureFilter", () => {
  it("stores texture transform and crop configuration in customData", async () => {
    const { BaseTextureFilter } = await loadBaseTextureFilterModule();
    const texture = { id: "mask" };
    const filter = new BaseTextureFilter({
      texture,
      translateX: 1,
      translateY: 2,
      cropX: 0.1,
      cropY: 0.2,
      cropWidth: 0.3,
      cropHeight: 0.4,
    });

    expect(filter.texture).toBe(texture);
    expect(filter.translateX).toBe(1);
    expect(filter.translateY).toBe(2);
    expect(filter.cropX).toBeCloseTo(0.1);
    expect(filter.cropY).toBeCloseTo(0.2);
    expect(filter.cropWidth).toBeCloseTo(0.3);
    expect(filter.cropHeight).toBeCloseTo(0.4);
  });

  it("provides default crop values for a full texture", async () => {
    const { BaseTextureFilter } = await loadBaseTextureFilterModule();
    const filter = new BaseTextureFilter();

    expect(filter.translateX).toBe(0);
    expect(filter.translateY).toBe(0);
    expect(filter.cropX).toBe(0);
    expect(filter.cropY).toBe(0);
    expect(filter.cropWidth).toBe(1);
    expect(filter.cropHeight).toBe(1);
  });

  it("builds GLSL wrappers around custom core shader code", async () => {
    const { BaseTextureFilter } = await loadBaseTextureFilterModule();
    const glsl = BaseTextureFilter.$createGLSL("oCl*=txCl;");

    expect(glsl).toContain("vec4 txCl=texture(");
    expect(glsl).toContain("oCl*=txCl;");
  });
});
