import {
  createMockDocument,
  createMockGl,
  installWebGL2RenderingContextMock,
} from "./unit/helpers/browserMocks.js";

installWebGL2RenderingContextMock();

if (!globalThis.document) {
  globalThis.document = createMockDocument(createMockGl());
}
