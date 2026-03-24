import { describe, expect, it } from "vitest";
import { Distortion } from "../../../src/attributes/Distortion";
import { expectCloseArray } from "../helpers/assertions";

describe("Distortion", () => {
  it("starts with an undistorted quad", () => {
    const distortion = new Distortion();

    expect(Array.from(distortion.cache)).toEqual([0, 0, 1, 0, 1, 1, 0, 1]);
    expect(distortion.distortTexture).toBe(true);
  });

  it("stores all corner coordinates through the accessors", () => {
    const distortion = new Distortion();

    distortion.topLeftX = 0.1;
    distortion.topLeftY = 0.2;
    distortion.topRightX = 0.9;
    distortion.topRightY = 0.3;
    distortion.bottomRightX = 0.8;
    distortion.bottomRightY = 0.7;
    distortion.bottomLeftX = 0.2;
    distortion.bottomLeftY = 0.6;

    expectCloseArray(expect, distortion.cache, [0.1, 0.2, 0.9, 0.3, 0.8, 0.7, 0.2, 0.6]);
  });
});
