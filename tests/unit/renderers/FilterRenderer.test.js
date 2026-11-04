import { describe, expect, it, vi } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";
import { attachRendererRuntime, createRendererContext } from "../helpers/rendererTestHarness";

const LOCATIONS = { aA: 0, uA: 1, uB: 2, uF: 3, uH: 4, uI: 5, uJ: 6, uK: 7, uL: 8 };

const createHarness = async (createFilters) => {
  const { FilterRenderer } = await loadSrcModuleWithBrowserMocks("../../../src/renderers/FilterRenderer.js");
  const filtersModule = await import("../../../src/filters/BrightnessFilter.js");
  const { gl, context } = createRendererContext();
  gl.uniform1i = vi.fn();
  gl.uniform1f = vi.fn();
  gl.uniform3f = vi.fn();
  gl.uniform1fv = vi.fn();
  gl.uniformMatrix2x4fv = vi.fn();
  gl.uniformMatrix3fv = vi.fn();

  const renderer = new FilterRenderer({ context, locations: [], filters: createFilters(filtersModule) });
  attachRendererRuntime(renderer, gl, LOCATIONS);
  renderer.$attachFramebufferAndClearFv = vi.fn();
  renderer.$framebuffers = [{ unbind: vi.fn() }, { unbind: vi.fn() }];
  renderer.$drawInstanced = vi.fn();
  return { renderer, gl, context };
};

// Records which framebuffer each pass writes and which one is bound as its source.
const recordPasses = (renderer, context) => {
  const [fb0, fb1] = renderer.$framebuffers;
  const names = new Map([
    [fb0, "fb0"],
    [fb1, "fb1"],
  ]);
  const passes = [];
  let source = "source";
  renderer.$attachFramebufferAndClearFv = vi.fn((target) => passes.push({ target: names.get(target) ?? "final", source }));
  context.useTextureAt.mockImplementation((texture) => {
    if (names.has(texture)) source = names.get(texture);
    return 0;
  });
  return passes;
};

const filterIdsOf = (gl) => gl.uniform1i.mock.calls.filter(([location]) => location === LOCATIONS.uI).map(([, id]) => id);

describe("FilterRenderer", () => {
  it("draws a disabled last filter as a passthrough instead of reusing the previous uniforms", async () => {
    const { renderer, gl } = await createHarness(({ BrightnessFilter }) => [
      new BrightnessFilter({ intensity: 2 }),
      new BrightnessFilter({ intensity: 3, on: false }),
    ]);
    renderer.filters.forEach((filter, index) => (filter.uniqueId = index));

    renderer.$render();

    expect(filterIdsOf(gl)).toEqual([0, -1]);
    const lastData = gl.uniform1fv.mock.calls.at(-1)[1];
    expect(lastData[2]).toBe(0);
    expect(renderer.$drawInstanced).toHaveBeenCalledTimes(2);
  });

  it("does not upload passthrough uniforms when the last filter is on", async () => {
    const { renderer, gl } = await createHarness(({ BrightnessFilter }) => [
      new BrightnessFilter({ on: false }),
      new BrightnessFilter({ intensity: 3 }),
    ]);
    renderer.filters.forEach((filter, index) => (filter.uniqueId = index));

    renderer.$render();

    expect(filterIdsOf(gl)).toEqual([1]);
    expect(gl.uniform1fv.mock.calls.at(-1)[1]).toBe(renderer.filters[1].data);
    expect(renderer.$drawInstanced).toHaveBeenCalledTimes(1);
  });

  it("draws the source unchanged for an empty chain", async () => {
    const { renderer, gl } = await createHarness(() => []);

    renderer.$render();

    expect(filterIdsOf(gl)).toEqual([-1]);
    expect(renderer.$drawInstanced).toHaveBeenCalledTimes(1);
  });

  it("shares one shader branch between tone map filters with different parameters", async () => {
    const { ToneMapFilter } = await import("../../../src/filters/ToneMapFilter.js");
    const { ToneMapType } = await import("../../../src/rendering/ToneMapType.js");
    const { renderer } = await createHarness(({ BrightnessFilter }) => [
      new ToneMapFilter({ intensity: 2, type: ToneMapType.REINHARD }),
      new BrightnessFilter(),
      new ToneMapFilter({ intensity: 0.5 }),
    ]);

    const shader = renderer.$createFragmentShader();
    const [first, brightness, second] = renderer.filters;

    expect(first.uniqueId).toBe(second.uniqueId);
    expect(brightness.uniqueId).not.toBe(first.uniqueId);
    expect(shader.split(first.GLSL)).toHaveLength(2);
  });

  it("alternates the intermediate framebuffers by drawn pass, not by filter index", async () => {
    const { renderer, context } = await createHarness(({ BrightnessFilter }) => [
      new BrightnessFilter(),
      new BrightnessFilter({ on: false }),
      new BrightnessFilter(),
      new BrightnessFilter(),
    ]);
    const passes = recordPasses(renderer, context);

    renderer.$render({});

    expect(passes).toEqual([
      { target: "fb0", source: "source" },
      { target: "fb1", source: "fb0" },
      { target: "final", source: "fb1" },
    ]);
  });

  it("starts with the first framebuffer when the first filter is off", async () => {
    const { renderer, context } = await createHarness(({ BrightnessFilter }) => [
      new BrightnessFilter({ on: false }),
      new BrightnessFilter(),
      new BrightnessFilter(),
    ]);
    const passes = recordPasses(renderer, context);

    renderer.$render({});

    expect(passes).toEqual([
      { target: "fb0", source: "source" },
      { target: "final", source: "fb0" },
    ]);
    passes.forEach(({ target, source }) => expect(target).not.toBe(source));
  });

  it("reads the radial centre Y only for the distance", async () => {
    const { renderer } = await createHarness(({ BrightnessFilter }) => [new BrightnessFilter()]);
    const shader = renderer.$createFragmentShader();

    expect(shader.split("uJ[5]")).toHaveLength(2);
    expect(shader).toContain("vec2 d=abs(v0.zw-vec2(uJ[4],uJ[5]));");
    expect(shader).toContain("ds=pow(pow(d.x,p)+pow(d.y,p),1./p),");
  });
});
