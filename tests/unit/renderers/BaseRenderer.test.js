import { describe, expect, it, vi } from "vitest";
import { createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadBaseRendererModule = () => loadSrcModuleWithBrowserMocks("../../../src/renderers/BaseRenderer.js");

describe("BaseRenderer", () => {
  it("initializes with default values", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const mockContext = { gl: createMockGl() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Trigger resize calculation
    renderer._resizeCalcFv();

    expect(renderer.width).toBe(1);
    expect(renderer.height).toBe(1);
    expect(renderer.widthHalf).toBe(0.5);
    expect(renderer.heightHalf).toBe(0.5);
    expect(renderer.clearColor).toBeDefined();
    expect(renderer.context).toBe(mockContext);
    expect(renderer._positionBuffer).toBeDefined();
    expect(renderer._elementArrayBuffer).toBeDefined();
  });

  it("sets size correctly", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const mockContext = { gl: createMockGl() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    renderer.setSize(800, 600);
    renderer._resizeCalcFv();

    expect(renderer.width).toBe(800);
    expect(renderer.height).toBe(600);
    expect(renderer.widthHalf).toBe(400);
    expect(renderer.heightHalf).toBe(300);
    expect(renderer.resized).toBe(true);
  });

  it("sets clearBeforeRender correctly", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const mockContext = { gl: createMockGl() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Initially should be noop
    expect(renderer._clearBeforeRenderFunc).toBeDefined();

    renderer.clearBeforeRender = true;
    expect(typeof renderer._clearBeforeRenderFunc).toBe("function");

    renderer.clearBeforeRender = false;
    expect(renderer._clearBeforeRenderFunc).toBeDefined(); // Should be noop again
  });

  it("creates buffers with proper WebGL calls", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    const mockContext = { gl, useProgram: vi.fn(), setSize: vi.fn() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader methods to avoid program building
    renderer.$createVertexShader = vi.fn(() => "vertex shader");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader");

    // Initialize $gl
    renderer._switchToProgram();

    gl.createBuffer = vi.fn(() => ({ id: "buffer" }));
    gl.bindBuffer = vi.fn();
    gl.enableVertexAttribArray = vi.fn();
    gl.vertexAttribPointer = vi.fn();
    gl.vertexAttribDivisor = vi.fn();

    renderer.$createBuffers();

    expect(gl.createBuffer).toHaveBeenCalledTimes(2); // position and element array buffers
    expect(gl.bindBuffer).toHaveBeenCalledTimes(2);
  });

  it("uploads buffers to WebGL", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    const mockContext = { gl, useProgram: vi.fn(), setSize: vi.fn() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader methods to avoid program building
    renderer.$createVertexShader = vi.fn(() => "vertex shader");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader");

    // Initialize $gl
    renderer._switchToProgram();

    gl.bindBuffer = vi.fn();
    gl.enableVertexAttribArray = vi.fn();
    gl.vertexAttribPointer = vi.fn();
    gl.vertexAttribDivisor = vi.fn();
    gl.bufferData = vi.fn();

    renderer.$uploadBuffers();

    expect(gl.bindBuffer).toHaveBeenCalledTimes(2);
    expect(gl.bufferData).toHaveBeenCalledTimes(2);
  });

  it("uses texture at specific location", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    const mockContext = {
      gl,
      useTextureAt: vi.fn(() => 5),
      useProgram: vi.fn(),
      setSize: vi.fn()
    };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader methods to avoid program building
    renderer.$createVertexShader = vi.fn(() => "vertex shader");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader");

    // Initialize $gl
    renderer._switchToProgram();

    gl.uniform1i = vi.fn();

    const texture = { id: "texture" };
    renderer.$useTextureAt(texture, 3, 2, true);

    expect(mockContext.useTextureAt).toHaveBeenCalledWith(texture, 2, expect.any(Number), true);
    expect(gl.uniform1i).toHaveBeenCalledWith(3, 5);
  });

  it("uses texture at default location", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    const mockContext = {
      gl,
      useTexture: vi.fn(() => 7),
      useProgram: vi.fn(),
      setSize: vi.fn()
    };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader methods to avoid program building
    renderer.$createVertexShader = vi.fn(() => "vertex shader");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader");

    // Initialize $gl
    renderer._switchToProgram();

    gl.uniform1i = vi.fn();

    const texture = { id: "texture" };
    renderer.$useTexture(texture, 4);

    expect(mockContext.useTexture).toHaveBeenCalledWith(texture, expect.any(Number), undefined);
    expect(gl.uniform1i).toHaveBeenCalledWith(4, 7);
  });

  it("draws instanced elements", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    const mockContext = { gl, useProgram: vi.fn(), setSize: vi.fn() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader methods to avoid program building
    renderer.$createVertexShader = vi.fn(() => "vertex shader");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader");

    // Initialize $gl
    renderer._switchToProgram();

    gl.drawElementsInstanced = vi.fn();

    renderer.$drawInstanced(42);

    expect(gl.drawElementsInstanced).toHaveBeenCalledWith(5, 4, 5123, 0, 42); // TRIANGLE_STRIP, 4 vertices, UNSIGNED_SHORT, offset 0, count 42
  });

  it("clears with correct color", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    const mockContext = { gl, useProgram: vi.fn(), setSize: vi.fn() };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader methods to avoid program building
    renderer.$createVertexShader = vi.fn(() => "vertex shader");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader");

    // Initialize $gl
    renderer._switchToProgram();

    gl.clearColor = vi.fn();
    gl.clear = vi.fn();

    renderer.clearColor.set(0.5, 0.3, 0.8, 0.9);
    renderer._clear();

    const clearColorCall = gl.clearColor.mock.calls[0];
    expect(clearColorCall[0]).toBeCloseTo(0.5);
    expect(clearColorCall[1]).toBeCloseTo(0.3);
    expect(clearColorCall[2]).toBeCloseTo(0.8);
    expect(clearColorCall[3]).toBeCloseTo(0.9);
    expect(gl.clear).toHaveBeenCalledWith(16384); // COLOR_BUFFER_BIT
  });

  it("builds shader program on first render", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    // Add shader methods to mock gl
    gl.createShader = vi.fn(() => ({ id: "shader" }));
    gl.shaderSource = vi.fn();
    gl.compileShader = vi.fn();
    gl.getShaderParameter = vi.fn(() => true);
    gl.createProgram = vi.fn(() => ({ id: "program" }));
    gl.attachShader = vi.fn();
    gl.linkProgram = vi.fn();
    gl.getProgramParameter = vi.fn(() => true);
    gl.getAttribLocation = vi.fn(() => 0);
    gl.getUniformLocation = vi.fn(() => ({ id: "location" }));
    gl.createVertexArray = vi.fn(() => ({ id: "vao" }));
    gl.useProgram = vi.fn();

    const mockContext = {
      gl,
      contextId: 1,
      useProgram: vi.fn(),
      setSize: vi.fn()
    };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Mock shader creation methods
    renderer.$createVertexShader = vi.fn(() => "vertex shader code");
    renderer.$createFragmentShader = vi.fn(() => "fragment shader code");

    renderer._switchToProgram();

    expect(renderer.$createVertexShader).toHaveBeenCalled();
    expect(renderer.$createFragmentShader).toHaveBeenCalled();
    expect(gl.createProgram).toHaveBeenCalled();
    expect(gl.createVertexArray).toHaveBeenCalled();
  });

  it("reuses program on subsequent renders", async () => {
    const { BaseRenderer } = await loadBaseRendererModule();

    const gl = createMockGl();
    gl.createProgram = vi.fn(() => ({ id: "program" }));

    const mockContext = {
      gl,
      contextId: 1,
      useProgram: vi.fn(),
      setSize: vi.fn()
    };
    const renderer = new BaseRenderer({ context: mockContext, locations: [] });

    // Set up initial state as if program was already created
    renderer._currentContextId = 1;
    renderer._currentRendererId = 1;
    renderer._rendererId = 1;
    renderer._program = { id: "existingProgram" };

    renderer._switchToProgram();

    expect(gl.createProgram).not.toHaveBeenCalled();
    expect(mockContext.useProgram).toHaveBeenCalled();
  });
});