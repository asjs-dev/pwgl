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
      panel: panelMock,
    }));

    globalThis.HTMLCanvasElement = function HTMLCanvasElement() {};
    HTMLCanvasElement.prototype.getContext = vi.fn(function (type) {
      return { type, canvas: this };
    });

    const { init } = await import("../../../debugger/init.js");
    const canvas = new HTMLCanvasElement();

    init({ maxFrameCount: 3 });

    const webglContext = canvas.getContext("webgl2");
    const twoDContext = canvas.getContext("2d");

    expect(panelMock).toHaveBeenCalled();
    expect(debugContextMock).toHaveBeenCalledWith({ type: "webgl2", canvas }, { maxFrameCount: 3 });
    expect(webglContext).toEqual({ wrapped: { type: "webgl2", canvas } });
    expect(twoDContext).toEqual({ type: "2d", canvas });
  });
});
