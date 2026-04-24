import { describe, expect, it, vi } from "vitest";
import { createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadTextureModule = () => loadSrcModuleWithBrowserMocks("../../../src/textures/Texture.js");

describe("Texture", () => {
  it("updates its size from the source element", async () => {
    const { Texture } = await loadTextureModule();
    const source = {
      tagName: "IMG",
      naturalWidth: 32,
      naturalHeight: 16,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const texture = new Texture(source, false);

    expect(texture.width).toBe(32);
    expect(texture.height).toBe(16);
    expect(texture.$renderSource).toBe(source);
  });

  it("registers a load handler when the source is not ready yet", async () => {
    const { Texture } = await loadTextureModule();
    const source = {
      tagName: "IMG",
      naturalWidth: 0,
      naturalHeight: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const texture = new Texture(source, false);

    expect(source.addEventListener).toHaveBeenCalledWith("load", texture.updateSize, { once: true });
  });

  it("chooses between create, update and bind branches in use()", async () => {
    const { Texture } = await loadTextureModule();
    const source = {
      tagName: "IMG",
      naturalWidth: 8,
      naturalHeight: 8,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const texture = new Texture(source, true);
    const gl = createMockGl();

    texture.useActiveTexture = vi.fn();
    texture.bindActiveTexture = vi.fn();
    texture.$baseTexture = { id: "existing" };

    gl.gl_id = 1;
    gl.createTexture = vi.fn(() => ({ id: "created" }));

    texture.use(gl, 0, false, 10);
    expect(gl.createTexture).toHaveBeenCalled();
    expect(texture.useActiveTexture).toHaveBeenCalledWith(gl, 0);

    texture.useActiveTexture.mockClear();
    texture.$currentAglId = 1;
    texture.$updated = true;
    texture.use(gl, 1, false, 20);
    expect(texture.useActiveTexture).toHaveBeenCalledWith(gl, 1);

    texture.useActiveTexture.mockClear();
    texture.$updated = false;
    texture._loaded = false;
    texture.shouldUpdate = false;
    texture.$currentActiveId = 0;
    texture.use(gl, 2, true, 20);
    expect(texture.bindActiveTexture).toHaveBeenCalledWith(gl, 2);
  });

  it("creates helper textures from image and video urls", async () => {
    const { Texture } = await loadTextureModule();

    const imageTexture = Texture.loadImage("/image.png", true);
    const videoTexture = Texture.loadVideo("/video.mp4");

    expect(imageTexture.source.tagName).toBe("IMG");
    expect(imageTexture.source.src).toBe("/image.png");
    expect(videoTexture.source.tagName).toBe("VIDEO");
    expect(videoTexture.source.src).toBe("/video.mp4");
  });
});
