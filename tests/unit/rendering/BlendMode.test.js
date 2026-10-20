import { describe, expect, it } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadBlendModeModule = () => loadSrcModuleWithBrowserMocks("../../../src/rendering/BlendMode.js");

describe("BlendMode", () => {
  it("creates blend mode descriptors from function and equation arrays", async () => {
    const { BlendMode } = await loadBlendModeModule();

    const simple = BlendMode.createBlendMode([1, 2]);
    const separate = BlendMode.createBlendMode([1, 2, 3, 4], [5, 6]);

    expect(simple.functionName).toBe("blendFunc");
    expect(simple.equationName).toBe("blendEquation");
    expect(separate.functionName).toBe("blendFuncSeparate");
    expect(separate.equationName).toBe("blendEquationSeparate");
  });

  it("exposes standard predefined blend modes", async () => {
    const { BlendMode } = await loadBlendModeModule();

    expect(BlendMode.NORMAL.functions).toHaveLength(4);
    expect(BlendMode.LIGHTEN.equations).toHaveLength(1);
    expect(BlendMode.NONE.functions).toEqual([0, 0]);
  });

  it("keeps OVERLAY as an alias of NORMAL_PM", async () => {
    const { BlendMode } = await loadBlendModeModule();

    expect(BlendMode.OVERLAY.functions).toEqual(BlendMode.NORMAL_PM.functions);
    expect(BlendMode.OVERLAY.equations).toEqual(BlendMode.NORMAL_PM.equations);
  });
});
