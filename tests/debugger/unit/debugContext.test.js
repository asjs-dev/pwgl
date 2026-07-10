import { beforeEach, describe, expect, it, vi } from "vitest";

const loadDebugContextModule = async () => {
  vi.resetModules();
  vi.doMock("../../../extensions/src/utils/enterFrame", () => ({
    enterFrame: vi.fn((callback) => {
      callback();
      return {
        stop: vi.fn(),
      };
    }),
  }));
  return import("../../../debugger/src/debugContext.ts");
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

  it("shows only the uploaded bufferData slice when array output is enabled", async () => {
    const { debugContext } = await loadDebugContextModule();
    const context = {
      canvas: {},
      bufferData: vi.fn(),
    };

    const proxy = debugContext(context, { flags: 6 });
    const data = new Float32Array([1, 2, 3, 4, 5]);
    proxy.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW, 1, 3);

    expect(PWGLDebugger.instances[0].snapshots[0][0].args).toEqual([
      WebGL2RenderingContext.ARRAY_BUFFER,
      new Float32Array([2, 3, 4]),
      WebGL2RenderingContext.STATIC_DRAW,
      1,
      3,
    ]);
    expect(context.bufferData).toHaveBeenCalledWith(
      WebGL2RenderingContext.ARRAY_BUFFER,
      data,
      WebGL2RenderingContext.STATIC_DRAW,
      1,
      3,
    );
  });

  it("keeps bufferSubData arguments unchanged when array output is enabled", async () => {
    const { debugContext } = await loadDebugContextModule();
    const context = {
      canvas: {},
      bufferSubData: vi.fn(),
    };

    const proxy = debugContext(context, { flags: 6 });
    const data = new Uint16Array([10, 20, 30, 40]);
    proxy.bufferSubData(WebGL2RenderingContext.ARRAY_BUFFER, 8, data, 1, 2);

    expect(PWGLDebugger.instances[0].snapshots[0][0].args).toEqual([
      WebGL2RenderingContext.ARRAY_BUFFER,
      8,
      data,
      1,
      2,
    ]);
    expect(context.bufferSubData).toHaveBeenCalledWith(WebGL2RenderingContext.ARRAY_BUFFER, 8, data, 1, 2);
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
