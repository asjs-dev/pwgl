import { vi } from "vitest";
import { createMockDocument, createMockGl } from "./browserMocks";

export const loadSrcModuleWithBrowserMocks = async (modulePath, options = {}) => {
  const { mockContext = true } = options;

  vi.resetModules();
  globalThis.document = createMockDocument(createMockGl());

  if (mockContext) {
    vi.doMock("../../../src/core/Context.js", () => ({ Context: class Context {} }));
  }

  return import(modulePath);
};
