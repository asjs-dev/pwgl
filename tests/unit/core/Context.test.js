import { describe, expect, it, vi } from "vitest";
import { createMockDocument, createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadContextModule = () => loadSrcModuleWithBrowserMocks("../../../src/core/Context.js", { mockContext: false });

describe("Context", () => {
  it("initializes with canvas and WebGL context", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    expect(context.canvas).toBe(canvas);
    expect(context.gl).toBe(gl);
    expect(context.contextId).toBeGreaterThan(0);
    expect(context.textureIds).toEqual([]);
    expect(context.textureSizes).toEqual([]);
  });

  it("clears textures and resets texture management", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    const textureInfo = {
      use: vi.fn(),
      width: 64,
      height: 32,
    };
    context.useTexture(textureInfo, 1);

    context.clearTextures();

    expect(context.textureIds).toEqual([]);
    expect(context.textureSizes).toEqual([]);

    const textureId = context.useTexture(textureInfo, 2);
    expect(textureId).toBe(0);
  });

  it("uses texture and assigns texture slot", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    const textureInfo = {
      use: vi.fn(),
      width: 256,
      height: 128,
    };

    const textureId = context.useTexture(textureInfo, 12345);

    expect(textureId).toBe(0);
    expect(textureInfo.use).toHaveBeenCalledWith(gl, 0, true, 12345);
    expect(context._textureMap[0]).toBe(textureInfo);
    expect(context.textureIds).toContain(0);
    expect(context.textureSizes[0]).toBe(256);
    expect(context.textureSizes[1]).toBe(128);
  });

  it("reuses existing texture slot", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    const textureInfo = {
      use: vi.fn(),
      width: 512,
      height: 256,
    };

    // First use
    context.useTexture(textureInfo, 12345);
    expect(context._textureMap[0]).toBe(textureInfo);

    // Second use should reuse slot
    textureInfo.use.mockClear();
    const textureId = context.useTexture(textureInfo, 12346, false);

    expect(textureId).toBe(0);
    expect(textureInfo.use).toHaveBeenCalledWith(gl, 0, false, 12346); // forceBind should be false
  });

  it("uses texture at specific slot", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    const textureInfo = {
      use: vi.fn(),
      width: 128,
      height: 64,
    };

    const textureId = context.useTextureAt(textureInfo, 5, 99999, false);

    expect(textureId).toBe(5);
    expect(textureInfo.use).toHaveBeenCalledWith(gl, 5, false, 99999);
    expect(context._textureMap[5]).toBe(textureInfo);
    expect(context.textureIds).toContain(5);
  });

  it("deactivates texture", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    const textureInfo = {
      unbindTexture: vi.fn(),
    };

    context._textureMap[3] = textureInfo;

    context.deactivateTexture(textureInfo);

    expect(textureInfo.unbindTexture).toHaveBeenCalledWith(gl, 3);
  });

  it("uses WebGL program and manages state", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.useProgram = vi.fn();
    gl.bindVertexArray = vi.fn();

    const context = new Context({ canvas });

    const program = { id: "program" };
    const vao = { id: "vao" };

    const result = context.useProgram(program, vao);

    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.bindVertexArray).toHaveBeenCalledWith(vao);
    expect(context._currentProgram).toBe(program);
  });

  it("skips program switch if same program", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.useProgram = vi.fn();
    gl.bindVertexArray = vi.fn();

    const context = new Context({ canvas });

    const program = { id: "program" };
    const vao = { id: "vao" };

    // First call
    context.useProgram(program, vao);
    expect(gl.useProgram).toHaveBeenCalledTimes(1);

    // Second call with same program
    gl.useProgram.mockClear();
    context.useProgram(program, vao);

    expect(gl.useProgram).not.toHaveBeenCalled();
  });

  it("sets canvas size", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    context.setCanvasSize(1024, 768);

    expect(canvas.width).toBe(1024);
    expect(canvas.height).toBe(768);
  });

  it("sets context viewport and scissor", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.viewport = vi.fn();
    gl.scissor = vi.fn();

    const context = new Context({ canvas });

    context.setSize(800, 600);

    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(gl.scissor).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(context._width).toBe(800);
    expect(context._height).toBe(600);
  });

  it("skips size setting if dimensions unchanged", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.viewport = vi.fn();
    gl.scissor = vi.fn();

    const context = new Context({ canvas });

    context.setSize(400, 300);
    gl.viewport.mockClear();
    gl.scissor.mockClear();

    context.setSize(400, 300); // Same dimensions

    expect(gl.viewport).not.toHaveBeenCalled();
    expect(gl.scissor).not.toHaveBeenCalled();
  });

  it("uses blend mode and applies WebGL state", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.blendFunc = vi.fn();
    gl.blendEquation = vi.fn();

    const context = new Context({ canvas });

    const blendMode = {
      functionName: "blendFunc",
      equationName: "blendEquation",
      functions: [1, 2, 3, 4],
      equations: [5, 6],
    };

    context.useBlendMode(blendMode);

    expect(gl.blendFunc).toHaveBeenCalledWith(1, 2, 3, 4);
    expect(gl.blendEquation).toHaveBeenCalledWith(5, 6);
    expect(context._currentBlendMode).toBe(blendMode);
  });

  it("sets blend mode with callback when mode changes", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });

    const callback = vi.fn();
    const blendMode1 = {
      functionName: "blendFunc",
      equationName: "blendEquation",
      functions: [1, 2, 3, 4],
      equations: [5, 6],
    };
    const blendMode2 = { ...blendMode1, functions: [7, 8, 9, 10] };

    context.setBlendMode(blendMode1, callback);
    expect(callback).toHaveBeenCalledTimes(1);

    context.setBlendMode(blendMode1, callback); // Same mode
    expect(callback).toHaveBeenCalledTimes(1); // Should not call again

    context.setBlendMode(blendMode2, callback); // Different mode
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("handles context loss and restoration", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    // Mock extensions
    gl.getExtension = vi.fn(() => ({
      loseContext: vi.fn(),
      restoreContext: vi.fn(),
    }));

    const context = new Context({ canvas });

    expect(context._loseContext).toBeDefined();
    expect(context._restoreContext).toBeDefined();
  });
});
