import { describe, expect, it } from "vitest";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadLightModule = () => loadSrcModuleWithBrowserMocks("../../../src/display/Light.js");

describe("Light", () => {
  it("initializes with point-light defaults", async () => {
    const { Light } = await loadLightModule();
    const light = new Light();

    expect(light.type).toBe(Light.Type.POINT);
    expect(light.castShadow).toBe(true);
    expect(light.shading).toBe(true);
    expect(light.centerReflection).toBe(true);
    expect(light.fading).toBe(true);
  });

  it("recomputes the packed flags when booleans change", async () => {
    const { Light } = await loadLightModule();
    const light = new Light();

    light.castShadow = false;
    light.shading = true;
    light.flattenShadow = true;
    light.centerReflection = false;
    light.fading = true;

    expect(light.flags).toBe(22);
  });

  it("expands corners beyond the base drawable quad", async () => {
    const { Light } = await loadLightModule();
    const light = new Light();

    light.$parent = {
      stage: {
        renderer: { widthHalf: 50, heightHalf: 50, height: 100 },
      },
    };
    light.matrixCache = new Float32Array([1, 0, 0, 1, 0, 0]);

    expect(light.getBounds()).toEqual({ x: -1, y: 0, width: 100, height: 101 });
  });
});
