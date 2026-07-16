import { describe, expect, it } from "vitest";
import { getImage, parse } from "../../../../extensions/src/textureAtlas/parser";

describe("texture atlas parser", () => {
  it("normalizes long json keys by asset name", () => {
    const parsed = parse(
      {
        image: { width: 128, height: 64, base64: "data:image/png;base64,atlas" },
        assets: {
          "hero.png": {
            exact: { x: 1, y: 2, width: 32, height: 16 },
            percent: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
            offset: { x: 5, y: -6 },
            rotated: 1,
          },
        },
      },
      "hero.png",
    );

    expect(parsed).toMatchObject({
      name: "hero.png",
      exact: { x: 1, y: 2, width: 32, height: 16 },
      percent: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
      offset: { x: 5, y: -6 },
      rotated: true,
      image: { width: 128, height: 64, base64: "data:image/png;base64,atlas" },
    });
  });

  it("normalizes short json keys and missing assets", () => {
    const json = {
      i: { w: 256, h: 128, b: "data:image/png;base64,short" },
      a: {
        "tile.png": {
          e: { x: 4, y: 8, w: 16, h: 32 },
          p: { x: 0, y: 0, w: 0.5, h: 0.25 },
          o: { x: 2, y: 3 },
          r: 1,
        },
      },
    };

    expect(parse(json, "missing.png")).toBe(null);
    expect(parse(json, "tile.png")).toMatchObject({
      exact: { x: 4, y: 8, width: 16, height: 32 },
      percent: { x: 0, y: 0, width: 0.5, height: 0.25 },
      offset: { x: 2, y: 3 },
      rotated: true,
      image: { width: 256, height: 128, base64: "data:image/png;base64,short" },
    });
  });

  it("loads an embedded base64 image when available", async () => {
    const OriginalImage = globalThis.Image;

    class MockImage extends EventTarget {
      _src = "";

      get src() {
        return this._src;
      }

      set src(value) {
        this._src = value;
        queueMicrotask(() => this.dispatchEvent(new Event("load")));
      }
    }

    globalThis.Image = MockImage;

    const image = await getImage({ image: { base64: "data:image/png;base64,atlas" } });

    expect(image).toBeInstanceOf(MockImage);
    expect(image?.src).toBe("data:image/png;base64,atlas");

    globalThis.Image = OriginalImage;
  });

  it("returns null when json has no embedded image", async () => {
    await expect(getImage({ image: { width: 1, height: 1 } })).resolves.toBe(null);
  });
});
