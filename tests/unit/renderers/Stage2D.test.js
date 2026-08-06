import { describe, expect, it, vi } from "vitest";
import { installWebGL2RenderingContextMock } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadStage2DModule = () => loadSrcModuleWithBrowserMocks("../../../src/renderers/Stage2D.js");
const loadImageModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/Image.js");

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
  it("allows subclasses to append per-image batch data", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }] = await Promise.all([loadStage2DModule(), loadImageModule()]);
    const renderer = new Stage2D({
      context: {
        canvas: createCanvas(),
        setBlendMode: vi.fn(),
        useTexture: vi.fn(() => -1),
      },
      locations: [],
    });
    const image = new Image();
    const addImageData = vi.spyOn(renderer, "$addImageData");

    renderer.container.addChild(image);
    renderer._drawItem(renderer.container);

    expect(addImageData).toHaveBeenCalledWith(image, 0);
    expect(renderer._batchItems).toBe(1);
  });

  it("supports externally registered rendering types and scopes", async () => {
    installWebGL2RenderingContextMock();
    const { Stage2D } = await loadStage2DModule();
    const renderer = new Stage2D({
      context: { canvas: createCanvas() },
      locations: [],
    });
    const scope = { draw: vi.fn() };
    const item = {
      RENDERING_TYPE: "custom",
      renderable: true,
      update: vi.fn(),
      callbackBeforeRender: vi.fn(),
      callbackAfterRender: vi.fn(),
    };

    renderer.setRenderingType(item.RENDERING_TYPE, scope.draw, scope);
    renderer._drawItem(item);

    expect(scope.draw).toHaveBeenCalledWith(item);
  });

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
