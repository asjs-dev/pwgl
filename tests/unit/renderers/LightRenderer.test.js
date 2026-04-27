import { describe, expect, it, vi } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";
import { createLightRendererHarness } from "../helpers/rendererTestHarness";

const loadLightRendererModule = () => loadSrcModuleWithBrowserMocks("../../../src/renderers/LightRenderer.js");

describe("LightRenderer", () => {
  it("initializes with default values", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const { renderer } = createLightRendererHarness(LightRenderer);

    expect(renderer.offsetX).toBe(0);
    expect(renderer.offsetY).toBe(0);
    expect(renderer.sourceTexture).toBeUndefined();
    expect(renderer.normalMap).toBeUndefined();
    expect(renderer.heightMap).toBeUndefined();
    expect(renderer.roughnessMap).toBeUndefined();
    expect(Array.from(renderer.clearColor.cache)).toEqual([0, 0, 0, 1]);
  });

  it("initializes with config values", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const config = {
      offsetX: 10,
      offsetY: 20,
      sourceTexture: { width: 100, height: 100 },
      normalMap: { width: 100, height: 100 },
      heightMap: { width: 100, height: 100 },
      roughnessMap: { width: 100, height: 100 },
      locations: []
    };

    const renderer = new LightRenderer(config);

    expect(renderer.offsetX).toBe(10);
    expect(renderer.offsetY).toBe(20);
    expect(renderer.sourceTexture).toBe(config.sourceTexture);
    expect(renderer.normalMap).toBe(config.normalMap);
    expect(renderer.heightMap).toBe(config.heightMap);
    expect(renderer.roughnessMap).toBe(config.roughnessMap);
  });

  it("sets offset values correctly", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer({ locations: [] });
    renderer.setOffset(15, 25);

    expect(renderer.offsetX).toBe(15);
    expect(renderer.offsetY).toBe(25);
  });

  it("updates sizable reference when setting sourceTexture", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer({ locations: [] });
    const texture = { width: 200, height: 150 };

    renderer.sourceTexture = texture;

    expect(renderer.sourceTexture).toBe(texture);
    expect(renderer._sizable).toBe(texture);
  });

  it("updates sizable reference when setting normalMap", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer({ locations: [] });
    const texture = { width: 200, height: 150 };

    renderer.normalMap = texture;

    expect(renderer.normalMap).toBe(texture);
    expect(renderer._sizable).toBe(texture);
  });

  it("updates sizable reference when setting heightMap", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer({ locations: [] });
    const texture = { width: 200, height: 150 };

    renderer.heightMap = texture;

    expect(renderer.heightMap).toBe(texture);
    expect(renderer._sizable).toBe(texture);
  });

  it("updates sizable reference when setting roughnessMap", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer({ locations: [] });
    const texture = { width: 200, height: 150 };

    renderer.roughnessMap = texture;

    expect(renderer.roughnessMap).toBe(texture);
    expect(renderer._sizable).toBe(texture);
  });

  it("creates vertex shader with proper GLSL defines", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer();
    const vertexShader = renderer.$createVertexShader();

    expect(vertexShader).toContain("#define Z vec3(0,1,-1)");
    expect(vertexShader).toContain("#define PI");
    expect(vertexShader).toContain("#define P vec4(1,-1,2,-2)");
    expect(vertexShader).toContain("in mat4 aB");
    expect(vertexShader).toContain("in mat2x3 aC");
    expect(vertexShader).toContain("out vec2 v0");
    expect(vertexShader).toContain("out vec4 v1");
    expect(vertexShader).toContain("flat out vec4 v2");
  });

  it("creates fragment shader with proper uniforms and random function", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const renderer = new LightRenderer();
    const fragmentShader = renderer.$createFragmentShader();

    expect(fragmentShader).toContain("#define HEIGHT 255.");
    expect(fragmentShader).toContain("#define Z vec3(0,1,-1)");
    expect(fragmentShader).toContain("uniform vec2 uF");
    expect(fragmentShader).toContain("uniform vec2 uG");
    expect(fragmentShader).toContain("uniform vec3 uO");
    expect(fragmentShader).toContain("uniform sampler2D uB,uC,uM,uN");
    expect(fragmentShader).toContain("float rand(vec2 p,float s)");
  });

  it("renders with proper uniform values", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const { renderer, gl, context } = createLightRendererHarness(LightRenderer);

    // Mock the required methods
    gl.uniform3f = vi.fn();
    gl.uniform2f = vi.fn();
    renderer.$useTexture = vi.fn();
    renderer.$uploadBuffers = vi.fn();
    renderer.$drawInstanced = vi.fn();
    renderer.context = { ...context, setBlendMode: vi.fn() };

    // Set up textures
    renderer.sourceTexture = { id: 1 };
    renderer.normalMap = { id: 2 };
    renderer.heightMap = { id: 3 };
    renderer.roughnessMap = { id: 4 };
    renderer.offsetX = 10;
    renderer.offsetY = 20;
    renderer._sizable = { width: 800, height: 600 };

    renderer.$render();

    expect(renderer.context.setBlendMode).toHaveBeenCalled();
    expect(renderer.$useTexture).toHaveBeenCalledTimes(4);
    expect(gl.uniform3f).toHaveBeenCalledWith(renderer.$locations.uO, true, true, true); // uO uniform
    expect(gl.uniform2f).toHaveBeenCalledWith(renderer.$locations.uF, 800, 600); // uF uniform
    expect(gl.uniform2f).toHaveBeenCalledWith(renderer.$locations.uG, 10, 20); // uG uniform (offset)
    expect(renderer.$uploadBuffers).toHaveBeenCalled();
    expect(renderer.$drawInstanced).toHaveBeenCalledWith(0);
  });

  it("renders without optional textures", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const { renderer, gl, context } = createLightRendererHarness(LightRenderer);

    gl.uniform3f = vi.fn();
    gl.uniform2f = vi.fn();
    renderer.$useTexture = vi.fn();
    renderer.$uploadBuffers = vi.fn();
    renderer.$drawInstanced = vi.fn();
    renderer.context = { ...context, setBlendMode: vi.fn() };

    // Only set heightMap (required for shadows)
    renderer.heightMap = { id: 3 };
    renderer._sizable = { width: 800, height: 600 };

    renderer.$render();

    expect(renderer.$useTexture).toHaveBeenCalledTimes(1); // Only heightMap
    expect(gl.uniform3f).toHaveBeenCalledWith(renderer.$locations.uO, false, false, false); // uO uniform (no textures)
  });

  it("creates and uploads extension buffer", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const { renderer, gl } = createLightRendererHarness(LightRenderer);

    gl.createBuffer = vi.fn(() => ({ id: "extBuffer" }));
    gl.bindBuffer = vi.fn();

    renderer.$createBuffers();

    expect(renderer._extensionBuffer).toBeDefined();
    expect(gl.createBuffer).toHaveBeenCalled();
    expect(gl.bindBuffer).toHaveBeenCalled();
  });

  it("uploads extension buffer data", async () => {
    const { LightRenderer } = await loadLightRendererModule();

    const { renderer, gl } = createLightRendererHarness(LightRenderer);

    renderer._extensionBuffer = {
      upload: vi.fn()
    };

    renderer.$uploadBuffers();

    expect(renderer._extensionBuffer.upload).toHaveBeenCalledWith(gl);
  });
});
