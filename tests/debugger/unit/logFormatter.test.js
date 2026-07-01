import { describe, expect, it } from "vitest";
import { COLORS, TYPES, getFormat } from "../../../debugger/src/logFormatter";

describe("logFormatter", () => {
  it("exports known type labels and color definitions", () => {
    expect(TYPES.FRAME).toBe("FRAME");
    expect(COLORS.some((entry) => entry.label === TYPES.DRAW)).toBe(true);
    expect(COLORS.some((entry) => entry.label === TYPES.ALERT)).toBe(true);
  });

  it("prioritizes timing-based alert and warning levels", () => {
    expect(getFormat(6, "drawArrays")).toBe(TYPES.ALERT);
    expect(getFormat(3, "drawArrays")).toBe(TYPES.WARN);
  });

  it("maps WebGL commands to semantic categories", () => {
    expect(getFormat(0, "useProgram")).toBe(TYPES.PROGRAM);
    expect(getFormat(0, "compileShader")).toBe(TYPES.SHADER);
    expect(getFormat(0, "bindTexture")).toBe(TYPES.BINDING);
    expect(getFormat(0, "bufferData")).toBe(TYPES.BUFFER_UPLOAD);
    expect(getFormat(0, "texParameteri")).toBe(TYPES.TEXTURE_PARAMS);
    expect(getFormat(0, "uniform1i")).toBe(TYPES.UNIFORMS);
    expect(getFormat(0, "vertexAttribPointer")).toBe(TYPES.VERTEX_ATTRIBUTES);
    expect(getFormat(0, "viewport")).toBe(TYPES.VIEWPORT);
    expect(getFormat(0, "blendFuncSeparate")).toBe(TYPES.BLENDING);
    expect(getFormat(0, "drawElements")).toBe(TYPES.DRAW);
    expect(getFormat(0, "bindFramebuffer")).toBe(TYPES.FRAMEBUFFERS);
    expect(getFormat(0, "renderbufferStorage")).toBe(TYPES.RENDERBUFFERS);
    expect(getFormat(0, "depthFunc")).toBe(TYPES.DEPTH_STENCIL);
    expect(getFormat(0, "createTexture2D")).toBe(TYPES.RESOURCES);
    expect(getFormat(0, "noop")).toBe(TYPES.BASE);
  });
});
