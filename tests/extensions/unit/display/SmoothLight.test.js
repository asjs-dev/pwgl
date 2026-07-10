import { describe, expect, it, vi } from "vitest";
import { installPWGLMock } from "../helpers/pwglExtensionMocks";

const loadSmoothLightModule = async () => {
  vi.resetModules();
  globalThis.window = {};
  const PWGL = installPWGLMock();
  return { ...(await import("../../../../extensions/src/display/SmoothLight.js")), PWGL };
};

describe("SmoothLight", () => {
  it("exports null when PWGL is not available", async () => {
    vi.resetModules();
    delete globalThis.window;
    delete globalThis.PWGL;

    const { SmoothLight } = await import("../../../../extensions/src/display/SmoothLight.js");

    expect(SmoothLight).toBe(null);
  });

  it("creates renderer helpers and exposes addLightForRender", async () => {
    const { SmoothLight, PWGL } = await loadSmoothLightModule();
    const light = new SmoothLight({ blur: 4 });

    expect(light.texture).toBeInstanceOf(PWGL.Framebuffer);
    expect(light.blur).toBe(4);
    expect(typeof light.addLightForRender).toBe("function");
    expect(light.blendMode).toBe(PWGL.BlendMode.SHADOW);
  });

  it("renders before resize without throwing", async () => {
    const { SmoothLight } = await loadSmoothLightModule();
    const light = new SmoothLight({ blur: 2 });

    expect(() => light.render()).not.toThrow();
    expect(light.lightRenderer.setSize).not.toHaveBeenCalled();
    expect(light.lightRenderer.renderToFramebuffer).toHaveBeenCalledWith(light._framebuffer);
  });

  it("resizes dependent renderers and renders to framebuffers", async () => {
    const { SmoothLight } = await loadSmoothLightModule();
    const light = new SmoothLight({ blur: 2 });

    light.setSize(320, 180);
    light.render();

    expect(light.lightRenderer.setSize).toHaveBeenCalledWith(320, 180);
    expect(light.filterRenderer.setSize).toHaveBeenCalledWith(320, 180);
    expect(light.lightRenderer.renderToFramebuffer).toHaveBeenCalledWith(light._framebuffer);
    expect(light.filterRenderer.renderToFramebuffer).toHaveBeenCalledWith(light._filterFramebuffer);
  });
});
