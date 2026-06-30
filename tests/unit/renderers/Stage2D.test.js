import { describe, expect, it, vi } from "vitest";
import { installWebGL2RenderingContextMock } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadStage2DModule = () => loadSrcModuleWithBrowserMocks("../../../src/renderers/Stage2D.js");

const createCanvas = () => ({
  width: 200,
  height: 100,
  offsetWidth: 100,
  offsetHeight: 50,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getBoundingClientRect: () => ({
    left: 10,
    top: 20,
    width: 100,
    height: 50,
  }),
});

describe("Stage2D", () => {
  it("maps touch pointer events through the canvas bounds", async () => {
    installWebGL2RenderingContextMock();
    const { Stage2D } = await loadStage2DModule();
    const canvas = createCanvas();
    const renderer = new Stage2D({
      context: {
        canvas,
      },
      locations: [],
    });

    renderer.setSize(200, 100);
    renderer.$resize();
    renderer._onMouseEventHandler({ type: "touchmove", touches: [{ clientX: 35, clientY: 45 }] });

    expect(renderer._mousePosition).toEqual({ x: -50, y: 0 });
  });

  it("uploads stage buffers for the active batch only", async () => {
    installWebGL2RenderingContextMock();
    const { Stage2D } = await loadStage2DModule();
    const renderer = new Stage2D({
      context: {
        canvas: createCanvas(),
      },
      locations: [],
    });
    const gl = {};

    renderer.$gl = gl;
    renderer._batchItems = 5;
    renderer._dataBuffer = {
      uploadElements: vi.fn(),
    };
    renderer._distortionBuffer = {
      uploadElements: vi.fn(),
    };
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

    expect(renderer._dataBuffer.uploadElements).toHaveBeenCalledWith(gl, 5);
    expect(renderer._distortionBuffer.uploadElements).toHaveBeenCalledWith(gl, 5);
    expect(renderer.$matrixBuffer.uploadElements).toHaveBeenCalledWith(gl, 5);
  });
});
