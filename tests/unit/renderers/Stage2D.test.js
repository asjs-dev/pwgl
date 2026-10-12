import { describe, expect, it, vi } from "vitest";
import { createMockGl, installWebGL2RenderingContextMock } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadStage2DModule = () => loadSrcModuleWithBrowserMocks("../../../src/renderers/Stage2D.js");
const loadImageModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/Image.js");
const loadContainerModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/Container.js");

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
    renderer.$drawItem(renderer.container);

    expect(addImageData).toHaveBeenCalledWith(image, 0);
    expect(renderer.$batchItems).toBe(1);
  });

  it("writes the alpha and tint of nested images from ancestors updated in the same pass", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }, { Container }] = await Promise.all([
      loadStage2DModule(),
      loadImageModule(),
      loadContainerModule(),
    ]);
    const renderer = new Stage2D({
      context: {
        canvas: createCanvas(),
        setBlendMode: vi.fn(),
        useTexture: vi.fn(() => -1),
      },
      locations: [],
    });
    const outer = new Container();
    const inner = new Container();
    const image = new Image();
    const data = renderer.$dataBuffer.data;

    renderer.container.alpha = 0.5;
    outer.alpha = 0.5;
    inner.alpha = 0.8;
    inner.useTint = 0.5;
    image.alpha = 0.5;
    image.tintType = 2;
    renderer.container.addChild(outer);
    outer.addChild(inner);
    inner.addChild(image);

    renderer.$drawItem(renderer.container);

    expect(data[4]).toBeCloseTo(0.1);
    expect(data[5]).toBeCloseTo(1);

    // Ancestor changes reach the next pass: each container updates before its children draw.
    renderer.$batchItems = 0;
    outer.alpha = 1;
    outer.useTint = false;
    renderer.$drawItem(renderer.container);

    expect(data[4]).toBeCloseTo(0.2);
    expect(data[5]).toBe(0);
  });

  it("uses the new parent's alpha and tint after an image is moved between passes", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }, { Container }] = await Promise.all([
      loadStage2DModule(),
      loadImageModule(),
      loadContainerModule(),
    ]);
    const renderer = new Stage2D({
      context: {
        canvas: createCanvas(),
        setBlendMode: vi.fn(),
        useTexture: vi.fn(() => -1),
      },
      locations: [],
    });
    const faded = new Container();
    const untinted = new Container();
    const image = new Image();
    const data = renderer.$dataBuffer.data;

    faded.alpha = 0.25;
    untinted.useTint = false;
    image.tintType = 1;
    renderer.container.addChild(faded);
    renderer.container.addChild(untinted);
    faded.addChild(image);

    renderer.$drawItem(renderer.container);

    expect(data[4]).toBeCloseTo(0.25);
    expect(data[5]).toBe(1);

    renderer.$batchItems = 0;
    untinted.addChild(image);
    renderer.$drawItem(renderer.container);

    expect(data[4]).toBe(1);
    expect(data[5]).toBe(0);
  });

  it("starts containers with neutral cached values until their first update", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }, { Container }] = await Promise.all([
      loadStage2DModule(),
      loadImageModule(),
      loadContainerModule(),
    ]);
    const renderer = new Stage2D({
      context: {
        canvas: createCanvas(),
        setBlendMode: vi.fn(),
        useTexture: vi.fn(() => -1),
      },
      locations: [],
    });
    const container = new Container();
    const image = new Image();

    container.alpha = 0.5;
    image.tintType = 1;
    container.addChild(image);

    expect(container.$premultipliedAlpha).toBe(1);
    expect(container.$premultipliedUseTint).toBe(1);

    // Drawn without the container's own update, as an item added mid-pass would be.
    renderer.$drawImage(image);

    expect(renderer.$dataBuffer.data[4]).toBe(1);
    expect(renderer.$dataBuffer.data[5]).toBe(1);
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
    renderer.$drawItem(item);

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
    renderer.$onMouseEventHandler({ type: "touchmove", touches: [{ clientX: 35, clientY: 45 }] });

    expect(renderer.$mousePosition).toEqual({ x: -50, y: 0 });
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
    renderer.$batchItems = 5;
    renderer.$dataBuffer = {
      uploadElements: vi.fn(),
    };
    renderer.$distortionBuffer = {
      uploadElements: vi.fn(),
    };
    renderer.$matrixBuffer = {
      uploadElements: vi.fn(),
    };
    renderer.$positionBuffer = {
      upload: vi.fn(),
    };
    renderer.$elementArrayBuffer = {
      upload: vi.fn(),
    };

    renderer.$uploadBuffers();

    expect(renderer.$dataBuffer.uploadElements).toHaveBeenCalledWith(gl, 5);
    expect(renderer.$distortionBuffer.uploadElements).toHaveBeenCalledWith(gl, 5);
    expect(renderer.$matrixBuffer.uploadElements).toHaveBeenCalledWith(gl, 5);
  });

  it("uploads sampler uniforms from the typed mirrors only when the texture slots changed", async () => {
    installWebGL2RenderingContextMock();
    const { Stage2D } = await loadStage2DModule();
    const context = {
      canvas: createCanvas(),
      textureIds: [0, 1],
      textureSizes: [64, 32, 16, 8],
      $textureIdData: new Int32Array([0, 1, 0, 0]),
      $textureSizeData: new Float32Array([64, 32, 16, 8, 0, 0, 0, 0]),
      $texturesChanged: true,
    };
    const renderer = new Stage2D({ context, locations: [] });
    const gl = { uniform1iv: vi.fn(), uniform2fv: vi.fn() };

    renderer.$gl = gl;
    renderer.$locations = { uB: "uB", uF: "uF" };
    renderer.$uploadBuffers = vi.fn();
    renderer.$drawInstanced = vi.fn();

    renderer.$batchItems = 3;
    renderer.$batchDraw();
    expect(gl.uniform1iv).toHaveBeenCalledWith("uB", context.$textureIdData, 0, 2);
    expect(gl.uniform2fv).toHaveBeenCalledWith("uF", context.$textureSizeData, 0, 4);
    expect(context.$texturesChanged).toBe(false);

    renderer.$batchItems = 3;
    renderer.$batchDraw();
    expect(gl.uniform1iv).toHaveBeenCalledTimes(1);
    expect(gl.uniform2fv).toHaveBeenCalledTimes(1);
    expect(renderer.$drawInstanced).toHaveBeenCalledTimes(2);

    context.$texturesChanged = true;
    renderer.$batchItems = 0;
    renderer.$batchDraw();
    expect(gl.uniform1iv).toHaveBeenCalledTimes(1);
    expect(context.$texturesChanged).toBe(true);
  });

  it("enables distortion by default", async () => {
    installWebGL2RenderingContextMock();
    const { Stage2D } = await loadStage2DModule();
    const renderer = new Stage2D({
      context: { canvas: createCanvas() },
      locations: [],
    });

    expect(renderer.$distortionBuffer).toBeDefined();

    const vertexShader = renderer.$createVertexShader();
    expect(vertexShader).toContain("aE");
    expect(vertexShader).toContain("clcQd");
    expect(vertexShader).toContain("mix(tPs,aA,aD[1].w)");
  });

  it("omits the distortion attribute, buffer and shader code when useDistortion is disabled", async () => {
    installWebGL2RenderingContextMock();
    const { Stage2D } = await loadStage2DModule();
    const renderer = new Stage2D({
      context: { canvas: createCanvas() },
      locations: [],
      useDistortion: false,
    });

    expect(renderer.$distortionBuffer).toBeUndefined();

    const vertexShader = renderer.$createVertexShader();
    expect(vertexShader).not.toContain("aE");
    expect(vertexShader).not.toContain("clcQd");
    expect(vertexShader).toContain("tPs=aA;");
    expect(vertexShader).toContain("aA,1.)");

    renderer.$gl = createMockGl();
    renderer.$locations = { aA: 0, aB: 1, aD: 5 };
    renderer.$createBuffers();
    expect(renderer.$distortionBuffer).toBeUndefined();

    renderer.$batchItems = 3;
    renderer.$dataBuffer = { uploadElements: vi.fn() };
    renderer.$matrixBuffer = { uploadElements: vi.fn() };
    renderer.$positionBuffer = { upload: vi.fn() };
    renderer.$elementArrayBuffer = { upload: vi.fn() };
    expect(() => renderer.$uploadBuffers()).not.toThrow();
  });

  it("registers pointer listeners and tracks interaction targets by default", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }] = await Promise.all([loadStage2DModule(), loadImageModule()]);
    const canvas = createCanvas();
    const renderer = new Stage2D({
      context: { canvas },
      locations: [],
    });

    expect(canvas.addEventListener).toHaveBeenCalled();

    const image = new Image();
    image.interactive = true;
    image.isContainsPoint = vi.fn(() => true);
    renderer.$isMousePositionSet = true;

    renderer.$checkMousePositionFv(image);

    expect(renderer.$eventTarget).toBe(image);
  });

  it("skips pointer listener registration and interaction checks when useInteraction is disabled", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }] = await Promise.all([loadStage2DModule(), loadImageModule()]);
    const canvas = createCanvas();
    const renderer = new Stage2D({
      context: { canvas },
      locations: [],
      useInteraction: false,
    });

    expect(canvas.addEventListener).not.toHaveBeenCalled();

    const image = new Image();
    image.interactive = true;
    image.isContainsPoint = vi.fn(() => true);
    renderer.$isMousePositionSet = true;

    expect(() => renderer.$checkMousePositionFv(image)).not.toThrow();
    expect(renderer.$eventTarget).toBeUndefined();
    expect(image.isContainsPoint).not.toHaveBeenCalled();
  });
});
