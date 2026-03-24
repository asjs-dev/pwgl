import { vi } from "vitest";
import { createMockDocument, createMockGl } from "./browserMocks";

export const loadSrcModuleWithBrowserMocks = async (modulePath) => {
  vi.resetModules();
  globalThis.document = createMockDocument(createMockGl());
  vi.doMock("../../../src/core/Context.js", () => ({ Context: class Context {} }));
  return import(modulePath);
};
