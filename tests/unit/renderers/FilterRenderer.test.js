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
  return { renderer, gl };
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
});
