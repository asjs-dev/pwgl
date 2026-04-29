import { beforeEach, describe, expect, it, vi } from "vitest";

const loadDebugContextModule = async () => {
  vi.resetModules();
  vi.doMock("../../../extensions/utils/enterFrame", () => ({
    enterFrame: vi.fn((callback) => {
      callback();
      return {
        stop: vi.fn(),
      };
    }),
  }));
  return import("../../../debugger/debugContext.js");
};

describe("debugContext", () => {
  beforeEach(() => {
    globalThis.PWGLDebugger = {
      instances: [],
    };
  });

  it("registers proxied contexts and records readable calls", async () => {
    const { debugContext } = await loadDebugContextModule();
    const context = {
      canvas: { id: "canvas" },
      clear: vi.fn(() => "ok"),
      value: 123,
    };

    let now = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const proxy = debugContext(context, { maxFrameCount: 2 });

    expect(PWGLDebugger.instances).toHaveLength(1);
    expect(proxy.value).toBe(123);

    now = 1001;
    proxy.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT, null, "");

    const snapshots = PWGLDebugger.instances[0].snapshots;
    expect(snapshots[0][0].prop).toBe("clear");
    expect(snapshots[0][0].args).toEqual(["COLOR_BUFFER_BIT", "null", '""']);
    expect(context.clear).toHaveBeenCalledWith(WebGL2RenderingContext.COLOR_BUFFER_BIT, null, "");
  });

  it("supports original values and compact array formatting", async () => {
    const { debugContext } = await loadDebugContextModule();
    const context = {
      canvas: {},
      bufferData: vi.fn(),
    };

    const proxy = debugContext(context, { flags: 2 });
    proxy.bufferData(new Float32Array([1, 2, 3]));

    expect(PWGLDebugger.instances[0].snapshots[0][0].args).toEqual(["[Float32Array(3)]"]);
  });

  it("stores stack traces when the corresponding flag is enabled", async () => {
    const { debugContext } = await loadDebugContextModule();
    const context = {
      canvas: {},
      useProgram: vi.fn(),
    };

    const proxy = debugContext(context, { flags: 1 });
    proxy.useProgram(1);

    expect(PWGLDebugger.instances[0].snapshots[0][0].stackTrace).toContain("Stack trace");
  });
});
