import { describe, expect, it } from "vitest";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_ATTRIBUTES,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
  BASE_VERTEX_SHADER_UNIFORMS,
  CREATE_ATLAS_CROP,
  CREATE_SAMPLING_FILTER,
  CREATE_TEXTURE_UNIT_LOOKUP,
  TINT_TYPE_SHADER,
} from "../../../src/utils/shaderUtils";

describe("shaderUtils", () => {
  it("assembles the base vertex shader parts consistently", () => {
    expect(BASE_VERTEX_SHADER).toContain("gl_Position");
    expect(BASE_VERTEX_SHADER_POSITION).toContain("aA.x");
    expect(BASE_VERTEX_SHADER_ATTRIBUTES).toContain("in vec2 aA;");
    expect(BASE_VERTEX_SHADER_UNIFORMS).toContain("uniform float uA;");
    expect(BASE_VERTEX_SHADER_INITIALIZATION).toBe(BASE_VERTEX_SHADER_ATTRIBUTES + BASE_VERTEX_SHADER_UNIFORMS);
  });

  it("creates tint shader snippets from identifiers", () => {
    const shader = TINT_TYPE_SHADER("id", "oCl", "tint");

    expect(shader).toContain("if(id>0.)");
    expect(shader).toContain("oCl*=tint;");
    expect(shader).toContain("oCl=tint;");
    expect(shader).toContain("oCl+=tint;");
  });

  it("wraps sampling filter code around a custom body", () => {
    const shader = CREATE_SAMPLING_FILTER("oCl*=.5;");

    expect(shader).toContain("if(v>0.)");
    expect(shader).toContain("texelFetch");
    expect(shader).toContain("oCl*=.5;");
  });

  it("creates a static if-chain dispatching a runtime index into a sampler array", () => {
    const shader = CREATE_TEXTURE_UNIT_LOOKUP({
      index: "i",
      uv: "cp",
      samplerArray: "uB",
      count: 3,
      miss: "Z.yyyy",
    });

    expect(shader).toBe(
      "if(i<1.)return texture(uB[0],cp);" +
        "if(i<2.)return texture(uB[1],cp);" +
        "if(i<3.)return texture(uB[2],cp);" +
        "return Z.yyyy;",
    );
  });

  it("builds an atlas-crop clamp expression from the given identifiers", () => {
    const expression = CREATE_ATLAS_CROP({ crop: "s", uv: "m", bias: "v2.zw" });

    expect(expression).toBe("clamp(mix(s.xy,s.zw,m),s.xy+v2.zw,s.zw-v2.zw)");
  });
});
