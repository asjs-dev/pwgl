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
    expect(context.$textureMap[0]).toBe(textureInfo);
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
    expect(context.$textureMap[0]).toBe(textureInfo);

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
    expect(context.$textureMap[5]).toBe(textureInfo);
    expect(context.textureIds).toContain(5);
  });

  it("mirrors texture slots into typed arrays and flags changes", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });
    const first = { use: vi.fn(), width: 64, height: 32 };
    const second = { use: vi.fn(), width: 16, height: 8 };

    expect(context.$texturesChanged).toBe(true);
    context.$texturesChanged = false;

    context.useTexture(first, 1);
    context.useTexture(second, 1);
    expect(context.$texturesChanged).toBe(true);
    expect(context.textureIds).toEqual([0, 1]);
    expect(context.textureSizes).toEqual([64, 32, 16, 8]);
    expect(Array.from(context.$textureIdData.subarray(0, 2))).toEqual([0, 1]);
    expect(Array.from(context.$textureSizeData.subarray(0, 4))).toEqual([64, 32, 16, 8]);

    context.$texturesChanged = false;
    context.useTexture(first, 2, false);
    expect(context.$texturesChanged).toBe(false);

    first.width = 128;
    context.useTexture(first, 3, false);
    expect(context.$texturesChanged).toBe(true);
    expect(context.$textureSizeData[0]).toBe(128);

    context.$texturesChanged = false;
    context.clearTextures();
    expect(context.$texturesChanged).toBe(true);
    expect(context.textureIds).toEqual([]);
    expect(context.textureSizes).toEqual([]);
  });

  it("skips slot bookkeeping for an already mapped texture", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    const context = new Context({ canvas });
    const textureInfo = { use: vi.fn(), width: 32, height: 16 };

    context.useTexture(textureInfo, 1);
    const useTextureAt = vi.spyOn(context, "useTextureAt");
    const includes = vi.spyOn(context.textureIds, "includes");

    expect(context.useTexture(textureInfo, 2, false)).toBe(0);
    expect(textureInfo.use).toHaveBeenLastCalledWith(gl, 0, false, 2);
    expect(useTextureAt).not.toHaveBeenCalled();
    expect(includes).not.toHaveBeenCalled();
    expect(context.textureIds).toEqual([0]);

    textureInfo.width = 64;
    context.useTexture(textureInfo, 3, false);
    expect(context.textureSizes).toEqual([64, 16]);
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

    context.$textureMap[3] = textureInfo;

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
    expect(context.$currentProgram).toBe(program);
    expect(context.$currentVertexArray).toBe(vao);
  });

  it("skips program and vertex array switches if both are unchanged", async () => {
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
    gl.bindVertexArray.mockClear();
    context.useProgram(program, vao);

    expect(gl.useProgram).not.toHaveBeenCalled();
    expect(gl.bindVertexArray).not.toHaveBeenCalled();
  });

  it("switches vertex arrays independently from programs", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.useProgram = vi.fn();
    gl.bindVertexArray = vi.fn();

    const context = new Context({ canvas });

    const program = { id: "program" };
    const firstVao = { id: "first-vao" };
    const secondVao = { id: "second-vao" };

    context.useProgram(program, firstVao);
    gl.useProgram.mockClear();
    gl.bindVertexArray.mockClear();

    context.useProgram(program, secondVao);

    expect(gl.useProgram).not.toHaveBeenCalled();
    expect(gl.bindVertexArray).toHaveBeenCalledOnce();
    expect(gl.bindVertexArray).toHaveBeenCalledWith(secondVao);
    expect(context.$currentVertexArray).toBe(secondVao);
  });

  it("switches programs independently from vertex arrays", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    const gl = createMockGl();
    canvas.getContext = vi.fn(() => gl);

    gl.useProgram = vi.fn();
    gl.bindVertexArray = vi.fn();

    const context = new Context({ canvas });

    const firstProgram = { id: "first-program" };
    const secondProgram = { id: "second-program" };
    const vao = { id: "vao" };

    context.useProgram(firstProgram, vao);
    gl.useProgram.mockClear();
    gl.bindVertexArray.mockClear();

    context.useProgram(secondProgram, vao);

    expect(gl.useProgram).toHaveBeenCalledOnce();
    expect(gl.useProgram).toHaveBeenCalledWith(secondProgram);
    expect(gl.bindVertexArray).not.toHaveBeenCalled();
    expect(context.$currentProgram).toBe(secondProgram);
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
    expect(context.$width).toBe(800);
    expect(context.$height).toBe(600);
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
    expect(context.$currentBlendMode).toBe(blendMode);
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

    expect(context.$loseContext).toBeDefined();
    expect(context.$restoreContext).toBeDefined();

    context.$currentProgram = { id: "program" };
    context.$currentVertexArray = { id: "vao" };
    context.$initContext();

    expect(context.$currentProgram).toBe(null);
    expect(context.$currentVertexArray).toBe(null);
  });

  it("keeps the canvas size when the context is restored", async () => {
    const { Context } = await loadContextModule();

    const canvas = createMockDocument().createElement("canvas");
    canvas.getContext = vi.fn(() => createMockGl());

    const context = new Context({ canvas });
    expect(canvas.width).toBe(1);
    expect(canvas.height).toBe(1);

    context.setCanvasSize(320, 180);
    context.$initContext();

    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(180);
  });
});
