import { describe, expect, it } from "vitest";
import { BaseDrawable } from "../../../src/display/BaseDrawable";

describe("BaseDrawable", () => {
  it("returns zero bounds by default when there is no stage", () => {
    const drawable = new BaseDrawable();

    expect(drawable.getBounds()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it("computes bounds from transformed corners when a stage is present", () => {
    const drawable = new BaseDrawable();

    drawable.$parent = {
      stage: {
        renderer: { widthHalf: 50, heightHalf: 50, height: 100 },
      },
    };
    drawable.matrixCache = new Float32Array([1, 0, 0, 1, 0, 0]);

    expect(drawable.getBounds()).toEqual({ x: 50, y: 0, width: 100, height: 50 });
  });
});
