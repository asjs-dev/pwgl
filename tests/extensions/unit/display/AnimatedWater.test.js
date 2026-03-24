import { describe, expect, it, vi } from "vitest";
import { installPWGLMock } from "../helpers/pwglExtensionMocks";

const loadAnimatedWaterModule = async () => {
  vi.resetModules();
  globalThis.window = {};
  const PWGL = installPWGLMock();
  return { ...(await import("../../../../extensions/display/AnimatedWater.js")), PWGL };
};

describe("AnimatedWater", () => {
  it("builds its internal display hierarchy and updates colors", async () => {
    const { AnimatedWater, PWGL } = await loadAnimatedWaterModule();
    const water = new AnimatedWater("/noise.png", 2, 0.4, 3);

    expect(PWGL.Texture.loadImage).toHaveBeenCalledWith("/noise.png");
    expect(water.children).toHaveLength(3);
    expect(water._backdropImage.color.g).toBe(0.4);
    expect(water._waterDisplacementImageLarge.color.set).toHaveBeenCalledTimes(1);
    expect(water._waterDisplacementImageLarge.color.g).toBeCloseTo(0.3);
  });

  it("updates size, movement target and animated offsets", async () => {
    const { AnimatedWater } = await loadAnimatedWaterModule();
    const water = new AnimatedWater("/noise.png", 1, 0, 1);

    water.setSize(200, 100);
    water.move(50, 25);
    water.render(0.5);

    expect(water._moveTarget).toEqual({ x: 0.25, y: 0.25 });
    expect(water._waterDisplacementImageSmall.transform.width).toBe(200);
    expect(water._waterDisplacementImageSmall.textureTransform.repeatY).toBeCloseTo(2);
    expect(water._waterDisplacementImageLarge.textureTransform.x).not.toBe(0);
  });
});
