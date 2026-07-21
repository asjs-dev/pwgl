import { describe, expect, it, vi } from "vitest";
import {
  createMockDocument,
  createMockGl,
  installWebGL2RenderingContextMock,
} from "../helpers/browserMocks";

const loadUtilsModule = async (documentMock = createMockDocument(createMockGl())) => {
  vi.resetModules();
  installWebGL2RenderingContextMock();
  globalThis.document = documentMock;
  globalThis.window = globalThis;

  return import("../../../src/core/Utils.js");
};

describe("Utils", () => {
  it("runs initApplication immediately when the document is ready", async () => {
    const { Utils } = await loadUtilsModule();
    const callback = vi.fn();

    Utils.initApplication(callback);

    expect(callback).toHaveBeenCalledWith(true);
  });

  it("runs initApplication after DOMContentLoaded while the document is loading", async () => {
    let listener;
    const documentMock = {
      ...createMockDocument(createMockGl()),
      readyState: "loading",
      addEventListener: vi.fn((type, fn) => {
        if (type === "DOMContentLoaded") {
          listener = fn;
        }
      }),
    };
    const { Utils } = await loadUtilsModule(documentMock);
    const callback = vi.fn();

    Utils.initApplication(callback);

    expect(callback).not.toHaveBeenCalled();
    expect(documentMock.addEventListener).toHaveBeenCalledWith("DOMContentLoaded", expect.any(Function), { once: true });

    listener(new Event("DOMContentLoaded"));

    expect(callback).toHaveBeenCalledWith(true);
  });
});
