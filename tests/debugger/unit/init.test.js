import { describe, expect, it, vi } from "vitest";

describe("init", () => {
  it("wraps webgl contexts while leaving other contexts untouched", async () => {
    vi.resetModules();

    const debugContextMock = vi.fn((ctx) => ({ wrapped: ctx }));
    const panelMock = vi.fn();

    vi.doMock("../../../debugger/debugContext.js", () => ({
      debugContext: debugContextMock,
    }));
    vi.doMock("../../../debugger/panel.js", () => ({
      panel: panelMock.mockReturnValue(vi.fn()),
    }));

    globalThis.HTMLCanvasElement = function HTMLCanvasElement() {};
    HTMLCanvasElement.prototype.getContext = vi.fn(function (type) {
      return { type, canvas: this };
    });

    const { init } = await import("../../../debugger/init.js");
    const canvas = new HTMLCanvasElement();

    const cleanup = init({ maxFrameCount: 3 });

    const webglContext = canvas.getContext("webgl2");
    const twoDContext = canvas.getContext("2d");

    expect(panelMock).toHaveBeenCalled();
    expect(debugContextMock).toHaveBeenCalledWith({ type: "webgl2", canvas }, { maxFrameCount: 3 });
    expect(webglContext).toEqual({ wrapped: { type: "webgl2", canvas } });
    expect(twoDContext).toEqual({ type: "2d", canvas });

    cleanup();
    expect(canvas.getContext("webgl2")).toEqual({ type: "webgl2", canvas });
  });

  it("cleans up the previous debugger init before installing a new one", async () => {
    vi.resetModules();

    const instanceCleanup = vi.fn();
    const firstPanelCleanup = vi.fn();
    const secondPanelCleanup = vi.fn();
    const panelMock = vi.fn().mockReturnValueOnce(firstPanelCleanup).mockReturnValueOnce(secondPanelCleanup);

    vi.doMock("../../../debugger/debugContext.js", () => ({
      debugContext: vi.fn((ctx) => ({ wrapped: ctx })),
    }));
    vi.doMock("../../../debugger/panel.js", () => ({
      panel: panelMock,
    }));

    globalThis.PWGLDebugger = {
      instances: [{ canvas: {}, snapshots: [], cleanup: instanceCleanup }],
    };
    globalThis.HTMLCanvasElement = function HTMLCanvasElement() {};
    HTMLCanvasElement.prototype.getContext = vi.fn(function (type) {
      return { type, canvas: this };
    });

    const { init } = await import("../../../debugger/init.js");

    const firstCleanup = init();
    const cleanup = init();

    expect(firstPanelCleanup).toHaveBeenCalled();
    expect(instanceCleanup).toHaveBeenCalled();
    expect(PWGLDebugger.instances).toEqual([]);

    firstCleanup();
    expect(firstPanelCleanup).toHaveBeenCalledTimes(1);

    cleanup();
    expect(secondPanelCleanup).toHaveBeenCalled();
  });
});
