import { beforeEach, describe, expect, it, vi } from "vitest";
import { expectCloseArray } from "../helpers/assertions";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadImageModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/Image.js");

describe("Image", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("updates texture transform and crop state", async () => {
    const { Image } = await loadImageModule();
    const image = new Image({ id: "texture" });

    image.parent = {
      colorUpdated: false,
      transformUpdated: false,
      colorCache: new Float32Array([1, 1, 1, 1]),
      matrixCache: new Float32Array([1, 0, 0, 1, 0, 0]),
      stage: null,
    };

    image.textureTransform.repeatX = 2;
    image.textureTransform.repeatY = 3;
    image.textureCrop.setRect({ x: 0.2, y: 0.3, width: 0.8, height: 0.9 });
    image.update();

    expectCloseArray(expect, image.textureMatrixCache, [2, 0, 0, 3, 0, 0]);
    expectCloseArray(expect, image.textureCrop.cache, [0.2, 0.3, 0.6, 0.6]);
  });

  it("rebuilds the inverse matrix for interactive images", async () => {
    const { Image } = await loadImageModule();
    const image = new Image({ id: "texture" });

    image.parent = {
      colorUpdated: false,
      transformUpdated: false,
      colorCache: new Float32Array([1, 1, 1, 1]),
      matrixCache: new Float32Array([1, 0, 0, 1, 0, 0]),
      stage: null,
    };
    image.interactive = true;
    image.transform.x = 10;
    image.transform.y = 20;
    image.update();

    expect(image.isContainsPoint({ x: 10.5, y: 20.5 })).toBe(true);
    expect(image.isContainsPoint({ x: 12, y: 25 })).toBe(false);
  });
});
