import { describe, expect, it } from "vitest";
import { BaseFilter } from "../../../src/filters/BaseFilter";

describe("BaseFilter", () => {
  it("initializes intensity-related values consistently", () => {
    const filter = new BaseFilter({ intensity: 2, mix: 0.25 });

    expect(filter.intensity).toBe(2);
    expect(filter.intensityX).toBe(2);
    expect(filter.intensityY).toBe(2);
    expect(filter.mix).toBe(0.25);
  });

  it("keeps transition as the inverse value inside the backing array", () => {
    const filter = new BaseFilter({ transition: 4 });

    expect(filter.transition).toBe(4);
    expect(filter.data[9]).toBeCloseTo(0.25);
  });

  it("accepts separate axis intensities and radial parameters", () => {
    const filter = new BaseFilter({
      intensityX: 3,
      intensityY: 5,
      isRadial: true,
      centerX: 0.1,
      centerY: 0.9,
      invertRadial: true,
      size: 0.75,
      roundness: 0.5,
    });

    expect(filter.intensityX).toBe(3);
    expect(filter.intensityY).toBe(5);
    expect(filter.isRadial).toBe(1);
    expect(filter.centerX).toBeCloseTo(0.1);
    expect(filter.centerY).toBeCloseTo(0.9);
    expect(filter.invertRadial).toBe(1);
    expect(filter.size).toBeCloseTo(0.75);
    expect(filter.roundness).toBeCloseTo(0.5);
  });

  it("copies kernel values into the backing typed array", () => {
    const filter = new BaseFilter({
      kernels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    });

    expect(Array.from(filter.kernels)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
