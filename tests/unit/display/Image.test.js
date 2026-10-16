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
    expectCloseArray(expect, image.textureCrop.cache, [0.2, 0.3, 0.8, 0.9]);
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

  it("rebuilds the inverse matrix when interactive is enabled after the last transform change", async () => {
    const { Image } = await loadImageModule();
    const image = new Image({ id: "texture" });

    image.parent = {
      colorCache: new Float32Array([1, 1, 1, 1]),
      matrixCache: new Float32Array([1, 0, 0, 1, 0, 0]),
      stage: null,
    };
    image.transform.x = 10;
    image.transform.y = 20;
    image.update();
    image.update();
    image.interactive = true;

    expect(image.isContainsPoint({ x: 10.5, y: 20.5 })).toBe(true);
    expect(image.isContainsPoint({ x: 0.5, y: 0.5 })).toBe(false);

    image.transform.x = 0;
    image.transform.y = 0;
    image.update();

    expect(image.isContainsPoint({ x: 0.5, y: 0.5 })).toBe(true);
  });

  it("returns the undistorted bounds with the default distortion", async () => {
    const { Image } = await loadImageModule();
    const image = new Image({ id: "texture" });

    image.parent = {
      stage: {
        renderer: { widthHalf: 50, heightHalf: 50, height: 100 },
      },
    };
    image.matrixCache = new Float32Array([1, 0, 0, 1, 0, 0]);

    expect(image.getBounds()).toEqual({ x: 50, y: 0, width: 100, height: 50 });
  });

  it("includes distorted corners in the bounds", async () => {
    const { Image } = await loadImageModule();
    const image = new Image({ id: "texture" });

    image.parent = {
      stage: {
        renderer: { widthHalf: 50, heightHalf: 50, height: 100 },
      },
    };
    image.matrixCache = new Float32Array([1, 0, 0, 1, 0, 0]);

    // corners moved outside the unit quad
    image.distortion.cache.set([-0.5, 0, 1, 0, 1, 1.5, 0, 1]);
    expect(image.getBounds()).toEqual({ x: 25, y: -25, width: 100, height: 50 });

    // corners moved inside the unit quad
    image.distortion.cache.set([0.25, 0.25, 0.75, 0.25, 0.75, 0.75, 0.25, 0.75]);
    expect(image.getBounds()).toEqual({ x: 62.5, y: 12.5, width: 87.5, height: 37.5 });
  });
});
