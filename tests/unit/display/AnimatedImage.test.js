import { describe, expect, it } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadAnimatedImageModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/AnimatedImage.js");

describe("AnimatedImage", () => {
  it("initializes stopped", async () => {
    const { AnimatedImage } = await loadAnimatedImageModule();
    const image = new AnimatedImage({ id: "texture" });

    expect(image.isPlaying).toBe(false);
  });

  it("uses the selected frame when going to a frame and stopping", async () => {
    const { AnimatedImage } = await loadAnimatedImageModule();
    const image = new AnimatedImage({ id: "texture" });
    image.frames = [
      { x: 0, y: 0, width: 10, height: 20, length: 50 },
      { x: 10, y: 0, width: 20, height: 30, length: 60 },
    ];

    image.gotoAndStop(1);

    expect(image.isPlaying).toBe(false);
    expect(image.textureCrop.width).toBe(20);
    expect(image.textureCrop.height).toBe(30);
  });

  it("advances frames while playing", async () => {
    const { AnimatedImage } = await loadAnimatedImageModule();
    const image = new AnimatedImage({ id: "texture" });

    image.parent = {
      colorUpdated: false,
      transformUpdated: false,
      colorCache: new Float32Array([1, 1, 1, 1]),
      matrixCache: new Float32Array([1, 0, 0, 1, 0, 0]),
      stage: null,
    };
    image.frames = [
      { x: 0, y: 0, width: 10, height: 10, length: 40 },
      { x: 10, y: 0, width: 20, height: 10, length: 40 },
    ];

    image.gotoAndPlay(0);
    image.update(image._currentRenderTime + 45);

    expect(image.isPlaying).toBe(true);
    expect(image.textureCrop.x).toBe(10);
    expect(image.textureCrop.width).toBe(20);
  });
});
