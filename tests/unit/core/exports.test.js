import { describe, expect, it, vi } from "vitest";
import {
  createMockDocument,
  createMockGl,
  installWebGL2RenderingContextMock,
} from "../helpers/browserMocks";

describe("PWGL exports", () => {
  it("exports the root API without registering PWGL on window", async () => {
    vi.resetModules();
    installWebGL2RenderingContextMock();
    globalThis.window = globalThis;
    globalThis.document = createMockDocument(createMockGl());
    delete globalThis.PWGL;
    delete globalThis.AGL;

    const PWGL = await import("../../../src/exports.js");

    expect(PWGL.version).toBe("{{appVersion}}");
    expect(PWGL.Stage2D).toBeDefined();
    expect(PWGL.Texture).toBeDefined();
    expect(PWGL.Image).toBeDefined();
    expect(PWGL.Utils).toBeDefined();
    expect(window.PWGL).toBeUndefined();
    expect(window.AGL).toBeUndefined();
  });

  it("exports the core post-processing filters and the tone map operators", async () => {
    vi.resetModules();
    installWebGL2RenderingContextMock();
    globalThis.window = globalThis;
    globalThis.document = createMockDocument(createMockGl());

    const PWGL = await import("../../../src/exports.js");

    for (const name of [
      "ColorLUTFilter",
      "FilmGrainFilter",
      "FXAAFilter",
      "ScanlineFilter",
      "ThresholdFilter",
      "ToneMapFilter",
    ]) {
      expect(PWGL[name], name).toBeTypeOf("function");
    }
    expect(PWGL.ToneMapType).toEqual({ REINHARD: 0, ACES: 1 });
  });
});
