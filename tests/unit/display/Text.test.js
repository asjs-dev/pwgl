import { describe, expect, it, vi } from "vitest";
import { createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadTextModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/Text.js");

const createParent = () => ({
  $colorVersion: 1,
  $transformVersion: 1,
  colorCache: new Float32Array([1, 1, 1, 1]),
  matrixCache: new Float32Array([1, 0, 0, 1, 0, 0]),
  stage: null,
});

// Updates the text and uploads its texture the way a renderer does once per frame.
const createScene = async () => {
  const { Text } = await loadTextModule();
  const text = new Text("Hello", { fontSize: 10 });
  const gl = createMockGl();
  let frame = 0;

  text.parent = createParent();
  text.transform.width = 64;
  text.transform.height = 16;

  gl.gl_id = 1;
  gl.texImage2D = vi.fn();
  const updateTexture = vi.spyOn(text, "$updateTexture");

  const render = () => {
    text.update();
    text.texture.use(gl, 0, false, ++frame);
  };

  // First frame: initial draw and upload.
  render();
  updateTexture.mockClear();
  gl.texImage2D.mockClear();

  return { text, gl, render, updateTexture };
};

describe("Text", () => {
  it("creates its texture without per-frame updates", async () => {
    const { text } = await createScene();

    expect(text.texture.shouldUpdate).toBeFalsy();
  });

  it("draws and uploads on the first frame", async () => {
    const { Text } = await loadTextModule();
    const text = new Text("Hello");
    const gl = createMockGl();

    text.parent = createParent();
    text.transform.width = 64;
    text.transform.height = 16;
    gl.gl_id = 1;
    gl.texImage2D = vi.fn();
    const updateTexture = vi.spyOn(text, "$updateTexture");

    text.update();
    text.texture.use(gl, 0, false, 1);
    text.update();
    text.texture.use(gl, 0, false, 2);

    expect(updateTexture).toHaveBeenCalledTimes(1);
    expect(gl.texImage2D).toHaveBeenCalledTimes(1);
    expect(text.$canvas.width).toBe(64);
    expect(text.$canvas.height).toBe(16);
  });

  it("neither redraws nor uploads on frames without changes", async () => {
    const { gl, render, updateTexture } = await createScene();

    render();
    render();

    expect(updateTexture).not.toHaveBeenCalled();
    expect(gl.texImage2D).not.toHaveBeenCalled();
  });

  it("neither redraws nor uploads when only the position or the parent transform changes", async () => {
    const { text, gl, render, updateTexture } = await createScene();

    text.transform.x = 10;
    render();
    text.transform.y = 20;
    render();
    text.parent.$transformVersion++;
    render();

    expect(text.transformUpdated).toBe(true);
    expect(updateTexture).not.toHaveBeenCalled();
    expect(gl.texImage2D).not.toHaveBeenCalled();
  });

  it.each([
    ["text", "World"],
    ["fontSize", 20],
    ["fontFamily", "serif"],
    ["fontColor", "#fff"],
    ["align", "center"],
    ["lineHeight", 2],
  ])("redraws and uploads once after %s changes", async (property, value) => {
    const { text, gl, render, updateTexture } = await createScene();

    text[property] = value;
    render();
    render();

    expect(updateTexture).toHaveBeenCalledTimes(1);
    expect(gl.texImage2D).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["width", 128],
    ["height", 32],
  ])("redraws and uploads once after transform.%s changes", async (property, value) => {
    const { text, gl, render, updateTexture } = await createScene();

    text.transform[property] = value;
    text.transform.x = 5;
    render();
    render();

    expect(updateTexture).toHaveBeenCalledTimes(1);
    expect(gl.texImage2D).toHaveBeenCalledTimes(1);
    expect(text.$canvas[property]).toBe(value);
  });

  it("redraws once when the text and the size change in the same frame", async () => {
    const { text, gl, render, updateTexture } = await createScene();

    text.text = "World";
    text.transform.width = 128;
    render();
    render();

    expect(updateTexture).toHaveBeenCalledTimes(1);
    expect(gl.texImage2D).toHaveBeenCalledTimes(1);
  });
});
