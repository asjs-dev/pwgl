import { describe, expect, it, vi } from "vitest";
import { createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadTextureInfoModule = () => loadSrcModuleWithBrowserMocks("../../../src/textures/TextureInfo.js");

describe("TextureInfo", () => {
  it("marks itself updated when texture parameters change", async () => {
    const { TextureInfo } = await loadTextureInfoModule();
    const texture = new TextureInfo();

    texture.wrapS = 1;
    texture.wrapT = 2;
    texture.minFilter = 3;
    texture.magFilter = 4;

    expect(texture.$updated).toBe(true);
  });

  it("binds, uploads and configures texture parameters", async () => {
    const { TextureInfo } = await loadTextureInfoModule();
    const texture = new TextureInfo();
    const gl = createMockGl();

    gl.activeTexture = vi.fn();
    gl.bindTexture = vi.fn();
    gl.texImage2D = vi.fn();
    gl.texParameteri = vi.fn();
    gl.generateMipmap = vi.fn();

    texture._baseTexture = { id: "texture" };
    texture.$renderSource = { id: "source" };
    texture.useActiveTexture(gl, 2);

    expect(gl.activeTexture).toHaveBeenCalled();
    expect(gl.bindTexture).toHaveBeenCalledWith(texture.target, texture._baseTexture);
    expect(gl.texImage2D).toHaveBeenCalled();
    expect(gl.texParameteri).toHaveBeenCalledTimes(6);
    expect(gl.generateMipmap).toHaveBeenCalledWith(texture.target);
  });

  it("unbinds textures from an active slot", async () => {
    const { TextureInfo } = await loadTextureInfoModule();
    const texture = new TextureInfo();
    const gl = createMockGl();

    gl.activeTexture = vi.fn();
    gl.bindTexture = vi.fn();

    texture.unbindTexture(gl, 1);

    expect(gl.activeTexture).toHaveBeenCalled();
    expect(gl.bindTexture).toHaveBeenCalledWith(texture.target, null);
  });
});
