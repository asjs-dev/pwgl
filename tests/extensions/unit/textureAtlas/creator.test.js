import { afterEach, describe, expect, it, vi } from "vitest";

class MockCanvasContext {
  imageSmoothingEnabled = true;

  drawImage = vi.fn();
  translate = vi.fn();
  rotate = vi.fn();
  getImageData = vi.fn((_x, _y, width, height) => ({
    data: new Uint8ClampedArray(width * height * 4).fill(255),
  }));
}

class MockCanvas {
  width = 0;
  height = 0;
  attributes = new Map();
  context = new MockCanvasContext();

  getContext() {
    return this.context;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  toDataURL() {
    return "data:image/png;base64,atlas";
  }
}

class MockImage extends EventTarget {
  naturalWidth = 16;
  naturalHeight = 8;
  width = 16;
  height = 8;
  attributes = new Map();
  _src = "";

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value;
    queueMicrotask(() => this.dispatchEvent(new Event("load")));
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
}

const installTextureAtlasMocks = () => {
  const originalCreateElement = document.createElement.bind(document);
  const originalImage = globalThis.Image;
  const originalHTMLImageElement = globalThis.HTMLImageElement;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "canvas") {
      return new MockCanvas();
    }

    return originalCreateElement(tagName);
  });

  globalThis.Image = MockImage;
  globalThis.HTMLImageElement = MockImage;
  URL.createObjectURL = vi.fn(() => "blob:image");
  URL.revokeObjectURL = vi.fn();

  return () => {
    vi.restoreAllMocks();
    globalThis.Image = originalImage;
    globalThis.HTMLImageElement = originalHTMLImageElement;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  };
};

describe("texture atlas creator", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("creates atlas json with clean names, offset metadata, base64 and long keys", async () => {
    const restore = installTextureAtlasMocks();
    const { create } = await import("../../../../extensions/src/textureAtlas/creator");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await create({
      images: [new File(["image"], "hero_offset_4_-2.png")],
      addBase64: true,
      useExactValues: true,
      usePercentValues: true,
    });

    expect(result.json.assets?.["hero.png"]).toMatchObject({
      exact: { x: 0, y: 0, width: 16, height: 8 },
      percent: { x: 0, y: 0, width: 1, height: 1 },
      offset: { x: 4, y: -2 },
    });
    expect(result.json.assets?.["hero_offset_4_-2.png"]).toBeUndefined();
    expect(result.json.image).toMatchObject({ width: 16, height: 8, base64: "data:image/png;base64,atlas" });
    expect(result.canvas.width).toBe(16);
    expect(result.canvas.height).toBe(8);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:image");

    consoleSpy.mockRestore();
    restore();
  });

  it("creates short-key atlas json", async () => {
    const restore = installTextureAtlasMocks();
    const { create } = await import("../../../../extensions/src/textureAtlas/creator");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await create({
      images: [new File(["image"], "tile_offset_1_2.png")],
      shortKeys: true,
    });

    expect(result.json.a?.["tile.png"]).toMatchObject({
      e: { x: 0, y: 0, w: 16, h: 8 },
      p: { x: 0, y: 0, w: 1, h: 1 },
      o: { x: 1, y: 2 },
    });
    expect(result.json.i).toMatchObject({ w: 16, h: 8 });

    consoleSpy.mockRestore();
    restore();
  });
});
