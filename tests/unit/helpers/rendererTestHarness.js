import { vi } from "vitest";
import { createMockGl } from "./browserMocks";

export const createRendererContext = (contextOverrides = {}, gl = createMockGl()) => {
  const context = {
    gl,
    useProgram: vi.fn(),
    setSize: vi.fn(),
    setBlendMode: vi.fn(),
    useTexture: vi.fn(() => 0),
    useTextureAt: vi.fn(() => 0),
    deactivateTexture: vi.fn(),
    ...contextOverrides,
  };

  return { gl, context };
};

export const attachRendererRuntime = (renderer, gl, locations) => {
  renderer.$gl = gl;
  renderer.$locations = locations;
  return renderer;
};

export const createLightRendererLocations = () => ({
  uA: 1,
  uB: 2,
  uC: 3,
  uF: 4,
  uG: 5,
  uM: 6,
  uN: 7,
  uO: 8,
  aA: 0,
  aB: 9,
  aC: 10,
});

export const createBatchRendererLocations = () => ({
  "": 0,
  aA: 1,
  aB: 2,
});

export const createLightRendererHarness = (LightRenderer, config = {}) => {
  const { gl, context } = createRendererContext();
  const renderer = new LightRenderer({ context, locations: [], ...config });
  attachRendererRuntime(renderer, gl, createLightRendererLocations());
  return { renderer, gl, context };
};

export const createBatchRendererHarness = (BatchRenderer, config = {}) => {
  const { gl, context } = createRendererContext();
  const renderer = new BatchRenderer({ context, locations: [], ...config });
  attachRendererRuntime(renderer, gl, createBatchRendererLocations());
  return { renderer, gl, context };
};
