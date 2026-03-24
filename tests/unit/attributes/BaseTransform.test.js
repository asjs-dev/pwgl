import { describe, expect, it } from "vitest";
import { BaseTransform } from "../../../src/attributes/BaseTransform";

describe("BaseTransform", () => {
  it("marks the transform as updated when position changes", () => {
    const transform = new BaseTransform();

    transform.x = 10;
    transform.y = 15;
    transform.update();

    expect(transform.updated).toBe(true);
    expect(transform.$transformUpdated).toBe(false);
  });

  it("updates sine and cosine caches from rotation", () => {
    const transform = new BaseTransform();

    transform.rotation = Math.PI / 2;
    transform.update();

    expect(transform.sinRotationA).toBeCloseTo(1);
    expect(transform.sinRotationB).toBeCloseTo(1);
    expect(transform.cosRotationA).toBeCloseTo(0);
    expect(transform.cosRotationB).toBeCloseTo(0);
  });

  it("includes skew when calculating cached rotation values", () => {
    const transform = new BaseTransform();

    transform.rotation = 0.5;
    transform.skewX = 0.1;
    transform.skewY = 0.2;
    transform.update();

    expect(transform.sinRotationA).toBeCloseTo(Math.sin(0.7));
    expect(transform.cosRotationA).toBeCloseTo(Math.cos(0.7));
    expect(transform.sinRotationB).toBeCloseTo(Math.sin(0.4));
    expect(transform.cosRotationB).toBeCloseTo(Math.cos(0.4));
  });

  it("marks anchor updates as transform changes", () => {
    const transform = new BaseTransform();

    transform.anchorX = 0.25;
    transform.anchorY = 0.75;
    transform.update();

    expect(transform.updated).toBe(true);
    expect(transform.anchorX).toBe(0.25);
    expect(transform.anchorY).toBe(0.75);
  });

  it("clears the updated flag after a second update with no changes", () => {
    const transform = new BaseTransform();

    transform.rotation = 0.1;
    transform.update();
    expect(transform.updated).toBe(true);

    transform.update();
    expect(transform.updated).toBe(false);
  });
});
