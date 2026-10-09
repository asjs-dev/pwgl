import { describe, expect, it, vi } from "vitest";
import { createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadFramebufferModule = () => loadSrcModuleWithBrowserMocks("../../../src/textures/Framebuffer.js");

const createFramebufferGl = () => {
  const gl = createMockGl();
  gl.gl_id = 1;
  gl.createTexture = vi.fn(() => ({ id: "texture" }));
  gl.createFramebuffer = vi.fn(() => ({ id: "framebuffer" }));
  gl.bindFramebuffer = vi.fn();
  gl.framebufferTexture2D = vi.fn();
  return gl;
};

describe("Framebuffer", () => {
  it("creates and attaches its framebuffer during its first use", async () => {
    const { Framebuffer } = await loadFramebufferModule();
    const framebuffer = new Framebuffer();
    const gl = createFramebufferGl();

    framebuffer.setSize(32, 16);
    framebuffer.use(gl, 0, false);

    expect(gl.createFramebuffer).toHaveBeenCalledOnce();
    expect(gl.framebufferTexture2D).toHaveBeenCalledOnce();
    expect(framebuffer.$updated).toBe(false);
    expect(framebuffer.$resized).toBe(false);
  });

  it("resizes immediately when size and texture parameters change together", async () => {
    const { Framebuffer } = await loadFramebufferModule();
    const framebuffer = new Framebuffer();
    const gl = createFramebufferGl();
    framebuffer.use(gl, 0, false);
    framebuffer.useActiveTexture = vi.fn();
    framebuffer.useActiveTextureAfterUpdate = vi.fn();

    framebuffer.setSize(64, 32);
    framebuffer.minFilter = WebGL2RenderingContext.NEAREST;
    framebuffer.use(gl, 0, false);

    expect(framebuffer.useActiveTexture).toHaveBeenCalledWith(gl, 0);
    expect(framebuffer.useActiveTextureAfterUpdate).not.toHaveBeenCalled();
    expect(framebuffer.$updated).toBe(false);
    expect(framebuffer.$resized).toBe(false);
  });
});
