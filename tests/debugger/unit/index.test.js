import { describe, expect, it, vi } from "vitest";

describe("debugger index", () => {
  it("registers PWGLDebugger on window", async () => {
    vi.resetModules();
    globalThis.window = globalThis;
    const initMock = vi.fn();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    vi.doMock("../../../debugger/init.js", () => ({
      init: initMock,
    }));

    await import("../../../debugger/index.js");

    expect(window.PWGLDebugger).toBeDefined();
    expect(window.PWGLDebugger.SHOW_CALL_STACKS).toBe(1);
    expect(window.PWGLDebugger.SHOW_ORIGINAL_VALUES).toBe(2);
    expect(window.PWGLDebugger.SHOW_ARRAYS).toBe(4);
    expect(window.PWGLDebugger.instances).toEqual([]);
    expect(window.PWGLDebugger.init).toBe(initMock);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
