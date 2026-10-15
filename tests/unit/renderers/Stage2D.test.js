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

const createTraversalSetup = async () => {
  installWebGL2RenderingContextMock();
  const [{ Stage2D }, { Image }, { Container }] = await Promise.all([
    loadStage2DModule(),
    loadImageModule(),
    loadContainerModule(),
  ]);
  const renderer = new Stage2D({
    context: { canvas: createCanvas() },
    locations: [],
  });
  const drawn = [];

  renderer.setRenderingType(Image.RENDERING_TYPE, (image) => drawn.push(image));

  const drawPass = () => {
    drawn.length = 0;
    renderer.$drawItem(renderer.container);
    return drawn.slice();
  };

  return { renderer, Image, Container, drawPass };
};

// One branch is hidden and shown again, its twin stays visible as the reference.
const createHiddenBranchSetup = async () => {
  const setup = await createTraversalSetup();
  const { renderer, Image, Container } = setup;
  const outer = new Container();
  const hidden = new Container();
  const hiddenInner = new Container();
  const hiddenImage = new Image();
  const visible = new Container();
  const visibleInner = new Container();
  const visibleImage = new Image();

  renderer.container.addChild(outer);
  outer.addChild(hidden);
  outer.addChild(visible);
  hidden.addChild(hiddenInner);
  hiddenInner.addChild(hiddenImage);
  visible.addChild(visibleInner);
  visibleInner.addChild(visibleImage);
  setup.drawPass();

  return { ...setup, outer, hidden, hiddenImage, visibleImage };
};

const createChildren = (Image, container, count) =>
  Array.from({ length: count }, () => {
    const image = new Image();
    container.addChild(image);
    return image;
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

    expect(addImageData).toHaveBeenCalledWith(image, 0, -1);
    expect(renderer.$batchItems).toBe(1);
  });

  it("resolves the texture unit itself when $addImageData is called without one", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }] = await Promise.all([loadStage2DModule(), loadImageModule()]);
    const useTexture = vi.fn(() => 3);
    const renderer = new Stage2D({
      context: { canvas: createCanvas(), useTexture },
      locations: [],
    });
    const image = new Image();

    renderer.container.addChild(image);
    renderer.$addImageData(image, 1);

    expect(useTexture).toHaveBeenCalledWith(image.texture, renderer.$renderTime, false);
    expect(renderer.$dataBuffer.data[12 + 6]).toBe(3);
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

  it("writes each image's caches to its own batch slot in the fixed buffer layout", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }] = await Promise.all([loadStage2DModule(), loadImageModule()]);
    const renderer = new Stage2D({
      context: {
        canvas: createCanvas(),
        setBlendMode: vi.fn(),
        useTexture: vi.fn(() => 3),
      },
      locations: [],
    });
    const images = createChildren(Image, renderer.container, 2);
    // Distinct value per cache cell and per image, so any misplaced or swapped write shows.
    const fill = (cache, base) => cache.set(Array.from({ length: cache.length }, (_, i) => base + i));

    images.forEach((image, slot) => {
      const base = (slot + 1) * 100;
      fill(image.matrixCache, base);
      fill(image.textureMatrixCache, base + 10);
      fill(image.textureCropCache, base + 20);
      fill(image.colorCache, base + 30);
      fill(image.textureRepeatRandomCache, base + 40);
      fill(image.distortionCache, base + 50);
      image.alpha = 0.5;
      image.tintType = 2;
      renderer.$drawImage(image);
    });

    const matrixData = renderer.$matrixBuffer.data;
    const data = renderer.$dataBuffer.data;
    const distortionData = renderer.$distortionBuffer.data;

    expect(renderer.$batchItems).toBe(2);
    images.forEach((image, slot) => {
      const base = (slot + 1) * 100;
      const range = (offset, length) => Array.from({ length }, (_, i) => base + offset + i);

      expect(Array.from(matrixData.subarray(slot * 16, slot * 16 + 16))).toEqual([
        ...range(0, 6),
        ...range(10, 6),
        ...range(20, 4),
      ]);
      expect(Array.from(data.subarray(slot * 12, slot * 12 + 12))).toEqual([
        ...range(30, 4),
        0.5,
        2,
        3,
        Number(image.distortion.distortTexture),
        ...range(40, 4),
      ]);
      expect(Array.from(distortionData.subarray(slot * 8, slot * 8 + 8))).toEqual(range(50, 8));
    });
  });

  it("writes an image that flushes the batch for a texture unit into the first slot of the next batch", async () => {
    installWebGL2RenderingContextMock();
    const [{ Stage2D }, { Image }] = await Promise.all([loadStage2DModule(), loadImageModule()]);
    let units = 0;
    const context = {
      canvas: createCanvas(),
      setBlendMode: vi.fn(),
      // Two texture units: the third texture flushes the batch through the callback, as Context does.
      useTexture: vi.fn((texture, renderTime, forceBind, callback) => {
        if (units === 2) {
          callback();
          units = 0;
        }
        return units++;
      }),
    };
    const renderer = new Stage2D({ context, locations: [] });
    const images = createChildren(Image, renderer.container, 3);
    const drawn = [];

    renderer.$uploadBuffers = vi.fn();
    renderer.$drawInstanced = vi.fn((count) => drawn.push(count));
    images.forEach((image, index) => {
      image.matrixCache.fill(index + 1);
      renderer.$drawImage(image);
    });

    expect(drawn).toEqual([2]);
    expect(renderer.$batchItems).toBe(1);
    expect(Array.from(renderer.$matrixBuffer.data.subarray(0, 6))).toEqual([3, 3, 3, 3, 3, 3]);
    expect(renderer.$dataBuffer.data[6]).toBe(0);
  });

  it("overwrites the previous image's distortion when a batch slot is reused", async () => {
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
    const [distorted, plain] = createChildren(Image, renderer.container, 2);
    const identity = Array.from(plain.distortionCache);

    distorted.distortionCache.set([1, 2, 3, 4, 5, 6, 7, 8]);
    renderer.$drawImage(distorted);
    renderer.$batchItems = 0;
    renderer.$drawImage(plain);

    expect(Array.from(renderer.$distortionBuffer.data.subarray(0, 8))).toEqual(identity);
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
  describe("hidden subtrees", () => {
    it("refreshes the children of a re-shown container with an ancestor transform changed while hidden", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();
      const update = vi.spyOn(hiddenImage, "update");

      hidden.renderable = false;
      outer.transform.x = 25;
      outer.transform.rotation = 0.5;
      drawPass();
      drawPass();

      expect(update).not.toHaveBeenCalled();
      expect(hiddenImage.matrixCache).not.toEqual(visibleImage.matrixCache);

      hidden.renderable = true;
      expect(drawPass()).toContain(hiddenImage);

      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
    });

    it("refreshes the children of a re-shown container with an ancestor color changed while hidden", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();

      hidden.renderable = false;
      outer.color.r = 0.5;
      outer.color.b = 0.25;
      drawPass();

      hidden.renderable = true;
      drawPass();

      expect(hiddenImage.colorCache).toEqual(visibleImage.colorCache);
      expect(hiddenImage.colorCache[0]).toBeCloseTo(0.5);
    });

    it("refreshes nested hidden containers shown again one after the other", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();
      const nested = hiddenImage.parent;

      hidden.renderable = false;
      nested.renderable = false;
      outer.transform.y = 15;
      drawPass();

      hidden.renderable = true;
      drawPass();
      drawPass();

      expect(visibleImage.matrixCache).not.toEqual(hiddenImage.matrixCache);

      nested.renderable = true;
      drawPass();

      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
    });

    it("refreshes the subtree of a container hidden and shown again from its own before render callback", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();

      hidden.callbackBeforeRender = (item) => {
        item.renderable = false;
      };
      outer.transform.x = 40;
      expect(drawPass()).not.toContain(hiddenImage);

      hidden.callbackBeforeRender = (item) => {
        item.renderable = true;
      };
      expect(drawPass()).toContain(hiddenImage);
      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
    });

    it("recalculates the children of a visible container only in the frame of the change", async () => {
      const { outer, visibleImage, drawPass } = await createHiddenBranchSetup();

      outer.transform.x = 5;
      drawPass();

      expect(visibleImage.transformUpdated).toBe(true);

      drawPass();

      expect(outer.transformUpdated).toBeFalsy();
      expect(visibleImage.transformUpdated).toBeFalsy();
      expect(visibleImage.colorUpdated).toBeFalsy();
    });

    it("picks up an ancestor change after being moved into a hidden container", async () => {
      const { outer, hidden, visibleImage, drawPass } = await createHiddenBranchSetup();
      const moved = visibleImage;

      hidden.renderable = false;
      hidden.addChild(moved);
      outer.transform.y = 12;
      drawPass();

      hidden.renderable = true;
      drawPass();

      expect(Array.from(moved.matrixCache)).toEqual(Array.from(hidden.children[0].children[0].matrixCache));
    });

    it("recalculates nothing when a container is shown again with nothing changed while hidden", async () => {
      const { hidden, hiddenImage, drawPass } = await createHiddenBranchSetup();
      const { $colorVersion, $transformVersion } = hiddenImage;
      const matrix = hiddenImage.matrixCache.slice();

      hidden.renderable = false;
      drawPass();

      hidden.renderable = true;
      drawPass();

      expect(hiddenImage.transformUpdated).toBeFalsy();
      expect(hiddenImage.colorUpdated).toBeFalsy();
      expect(hiddenImage.$transformVersion).toBe($transformVersion);
      expect(hiddenImage.$colorVersion).toBe($colorVersion);
      expect(hiddenImage.matrixCache).toEqual(matrix);
    });

    it("refreshes a container shown again after many hidden frames and several ancestor changes", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();

      hidden.renderable = false;
      outer.transform.x = 10;
      for (let i = 0; i < 10; i++) drawPass();
      outer.transform.y = 20;
      outer.color.g = 0.5;
      for (let i = 0; i < 5; i++) drawPass();

      hidden.renderable = true;
      drawPass();

      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
      expect(hiddenImage.colorCache).toEqual(visibleImage.colorCache);
    });

    it("recalculates only the color channel after a color-only ancestor change, even while hidden", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();
      const { $transformVersion } = hiddenImage;

      hidden.renderable = false;
      outer.color.r = 0.5;
      drawPass();

      expect(visibleImage.colorUpdated).toBe(true);
      expect(visibleImage.transformUpdated).toBeFalsy();

      hidden.renderable = true;
      drawPass();

      expect(hiddenImage.colorUpdated).toBe(true);
      expect(hiddenImage.transformUpdated).toBeFalsy();
      expect(hiddenImage.$transformVersion).toBe($transformVersion);
      expect(hiddenImage.colorCache[0]).toBeCloseTo(0.5);
    });

    it("recalculates only the transform channel after a transform-only ancestor change, even while hidden", async () => {
      const { outer, hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();
      const { $colorVersion } = hiddenImage;

      hidden.renderable = false;
      outer.transform.x = 8;
      drawPass();

      expect(visibleImage.transformUpdated).toBe(true);
      expect(visibleImage.colorUpdated).toBeFalsy();

      hidden.renderable = true;
      drawPass();

      expect(hiddenImage.transformUpdated).toBe(true);
      expect(hiddenImage.colorUpdated).toBeFalsy();
      expect(hiddenImage.$colorVersion).toBe($colorVersion);
      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
    });

    it("picks up the new parent's values after being moved under an already updated parent", async () => {
      const { hidden, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();
      const visibleInner = visibleImage.parent;

      visibleInner.transform.x = 14;
      visibleInner.color.b = 0.25;
      drawPass();
      drawPass();

      visibleInner.addChild(hiddenImage);
      drawPass();

      expect(hidden.children[0].children).not.toContain(hiddenImage);
      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
      expect(hiddenImage.colorCache).toEqual(visibleImage.colorCache);
    });

    it("propagates an ancestor change consumed by an update outside the render pass", async () => {
      const { outer, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();
      const before = visibleImage.matrixCache.slice();

      outer.transform.x = 9;
      outer.color.r = 0.5;
      outer.update();
      drawPass();

      expect(visibleImage.matrixCache).not.toEqual(before);
      expect(visibleImage.matrixCache).toEqual(hiddenImage.matrixCache);
      expect(visibleImage.colorCache[0]).toBeCloseTo(0.5);
    });

    it("refreshes the subtree of a re-shown stage container", async () => {
      const { renderer, outer, hiddenImage, visibleImage, drawPass } = await createHiddenBranchSetup();

      renderer.container.renderable = false;
      outer.transform.x = 33;
      drawPass();

      renderer.container.renderable = true;
      drawPass();

      expect(hiddenImage.matrixCache).toEqual(visibleImage.matrixCache);
      expect(visibleImage.matrixCache[4]).not.toBe(0);
    });

    it("recalculates the projection of a stage container resized while hidden", async () => {
      const { renderer, drawPass } = await createTraversalSetup();
      const stage = renderer.container;

      drawPass();
      const previousProjection = stage.matrixCache.slice();

      stage.renderable = false;
      renderer.width = 400;
      renderer.height = 300;
      renderer.$resize();
      drawPass();
      renderer.resized = false;

      stage.renderable = true;
      drawPass();

      const { Matrix3Utilities } = await loadSrcModuleWithBrowserMocks("../../../src/math/Matrix3Utilities.js");
      const expectedProjection = Matrix3Utilities.identity();
      Matrix3Utilities.projection(expectedProjection, renderer);

      expect(stage.matrixCache).toEqual(expectedProjection);
      expect(stage.matrixCache).not.toEqual(previousProjection);
    });
  });

  describe("render callbacks", () => {
    it("runs the before render callback before the update and applies its changes in the same frame", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [image] = createChildren(Image, renderer.container, 1);
      const reference = new Image();
      const calls = [];

      drawPass();
      vi.spyOn(image, "update").mockImplementation(function () {
        calls.push("update");
        return Image.prototype.update.call(this);
      });
      image.callbackBeforeRender = (item) => {
        calls.push("before");
        item.transform.x = 30;
      };
      image.callbackAfterRender = () => calls.push("after");
      reference.transform.x = 30;
      renderer.container.addChild(reference);

      drawPass();

      expect(calls).toEqual(["before", "update", "after"]);
      expect(image.matrixCache).toEqual(reference.matrixCache);
    });
  });

  describe("mid-pass child changes", () => {
    it("neither updates nor draws a child that removes itself before render, and skips the next sibling for that frame", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [a, b, c] = createChildren(Image, renderer.container, 3);
      const update = vi.spyOn(b, "update");
      const afterRender = vi.fn();

      b.callbackBeforeRender = (item) => item.remove();
      b.callbackAfterRender = afterRender;

      expect(drawPass()).toEqual([a]);
      expect(update).not.toHaveBeenCalled();
      expect(afterRender).toHaveBeenCalledWith(b, renderer.$renderTime);
      expect(drawPass()).toEqual([a, c]);
    });

    it("never draws an undefined child when children remove themselves after render", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [a, b, c] = createChildren(Image, renderer.container, 3);
      const drawItem = vi.spyOn(renderer, "$drawItem");

      b.callbackAfterRender = (item) => item.remove();
      c.callbackAfterRender = (item) => item.remove();

      expect(drawPass()).toEqual([a, b]);
      expect(drawItem.mock.calls.every(([item]) => item)).toBe(true);
      expect(drawPass()).toEqual([a, c]);
      expect(renderer.container.children).toEqual([a]);
    });

    it("does not draw an item moved to another container in its own callback until the next frame", async () => {
      const { renderer, Image, Container, drawPass } = await createTraversalSetup();
      const visited = new Container();
      const main = new Container();
      const afterRender = vi.fn();

      renderer.container.addChild(visited);
      renderer.container.addChild(main);
      const [a, b, c] = createChildren(Image, main, 3);

      b.callbackBeforeRender = (item) => {
        item.callbackBeforeRender = null;
        visited.addChild(item);
      };
      b.callbackAfterRender = afterRender;

      expect(drawPass()).not.toContain(b);
      expect(afterRender).toHaveBeenCalledTimes(1);
      expect(drawPass()).toEqual([b, a, c]);
    });

    it("skips the next sibling for that frame when an already drawn sibling is removed", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [a, b, c, d] = createChildren(Image, renderer.container, 4);

      c.callbackBeforeRender = () => a.remove();

      expect(drawPass()).toEqual([a, b, c]);
      expect(drawPass()).toEqual([b, c, d]);
    });

    it("does not draw a sibling removed before it is reached", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [a, b, c, d] = createChildren(Image, renderer.container, 4);

      a.callbackAfterRender = () => c.remove();

      expect(drawPass()).toEqual([a, b, d]);
    });

    it("draws a child added after the current one in the same frame", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [a, b] = createChildren(Image, renderer.container, 2);
      const added = new Image();

      a.callbackAfterRender = () => {
        a.callbackAfterRender = null;
        renderer.container.addChild(added);
      };

      expect(drawPass()).toEqual([a, b, added]);
    });

    it("visits the current child again when a child is inserted before it", async () => {
      const { renderer, Image, drawPass } = await createTraversalSetup();
      const [a, b, c] = createChildren(Image, renderer.container, 3);
      const added = new Image();

      b.callbackAfterRender = () => {
        b.callbackAfterRender = null;
        renderer.container.addChildAt(added, 0);
      };

      expect(drawPass()).toEqual([a, b, b, c]);
      expect(drawPass()).toEqual([added, a, b, c]);
    });
  });
});
