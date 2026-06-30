import { describe, expect, it, vi } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";
import { createBatchRendererHarness } from "../helpers/rendererTestHarness";

const loadBatchRendererModule = () => loadSrcModuleWithBrowserMocks("../../../src/renderers/BatchRenderer.js");

const getElementCountFromBuffer = (buffer) => buffer.data.length / buffer._cols / buffer._rows;

describe("BatchRenderer", () => {
  it("initializes with default max render count", async () => {
    const { BatchRenderer } = await loadBatchRendererModule();

    const renderer = new BatchRenderer({ locations: [] });

    expect(renderer.$MAX_RENDER_COUNT).toBe(10000);
    expect(renderer.$matrixBuffer).toBeDefined();
    expect(renderer.$matrixBuffer._locationName).toBe("aB");
    expect(getElementCountFromBuffer(renderer.$matrixBuffer)).toBe(10000);
    expect(renderer.$matrixBuffer._rows).toBe(4);
    expect(renderer.$matrixBuffer._target).toBe(34962); // ARRAY_BUFFER
  });

  it("initializes with custom max render count", async () => {
    const { BatchRenderer } = await loadBatchRendererModule();

    const renderer = new BatchRenderer({ maxRenderCount: 5000, locations: [] });

    expect(renderer.$MAX_RENDER_COUNT).toBe(5000);
    expect(getElementCountFromBuffer(renderer.$matrixBuffer)).toBe(5000);
  });

  it("creates matrix buffer with proper attributes", async () => {
    const { BatchRenderer } = await loadBatchRendererModule();

    const { renderer, gl } = createBatchRendererHarness(BatchRenderer);

    gl.createBuffer = vi.fn(() => ({ id: "matrixBuffer" }));
    gl.bindBuffer = vi.fn();
    renderer.$createBuffers();

    expect(gl.createBuffer).toHaveBeenCalled();
    expect(gl.bindBuffer).toHaveBeenCalledWith(34962, { id: "matrixBuffer" });
    expect(renderer.$matrixBuffer._locationName).toBe("aB");
  });

  it("uploads matrix buffer data", async () => {
    const { BatchRenderer } = await loadBatchRendererModule();

    const { renderer, gl } = createBatchRendererHarness(BatchRenderer);
    renderer._batchItems = 7;

    renderer.$matrixBuffer = {
      uploadElements: vi.fn(),
    };
    renderer._positionBuffer = {
      upload: vi.fn(),
    };
    renderer._elementArrayBuffer = {
      upload: vi.fn(),
    };

    renderer.$uploadBuffers();

    expect(renderer.$matrixBuffer.uploadElements).toHaveBeenCalledWith(gl, 7);
    expect(renderer._positionBuffer.upload).toHaveBeenCalledWith(gl);
    expect(renderer._elementArrayBuffer.upload).toHaveBeenCalledWith(gl);
  });

  it("inherits from BaseRenderer", async () => {
    const { BatchRenderer } = await loadBatchRendererModule();

    const renderer = new BatchRenderer({ locations: [] });

    expect(renderer).toBeInstanceOf(BatchRenderer);
    // Check that it has BaseRenderer methods
    expect(typeof renderer.$createBuffers).toBe("function");
    expect(typeof renderer.$uploadBuffers).toBe("function");
  });

  it("sets up matrix buffer with correct data layout", async () => {
    const { BatchRenderer } = await loadBatchRendererModule();

    const renderer = new BatchRenderer({ maxRenderCount: 2, locations: [] });

    // Check buffer data structure (16 floats per matrix * 2 items = 32 floats)
    expect(renderer.$matrixBuffer.data).toBeInstanceOf(Float32Array);
    expect(renderer.$matrixBuffer.data.length).toBe(32); // 2 matrices * 16 floats each
  });
});
