import { describe, expect, it } from "vitest";
import { TextureTransform } from "../../../src/attributes/TextureTransform";

describe("TextureTransform", () => {
  it("initializes repeat values and cached scaled size", () => {
    const transform = new TextureTransform();

    expect(transform.repeatX).toBe(1);
    expect(transform.repeatY).toBe(1);
    expect(transform.scaledWidth).toBe(1);
    expect(transform.scaledHeight).toBe(1);
  });

  it("updates repeat values and marks the transform as changed", () => {
    const transform = new TextureTransform();

    transform.repeatX = 3;
    transform.repeatY = 4;
    transform.update();

    expect(transform.scaledWidth).toBe(3);
    expect(transform.scaledHeight).toBe(4);
    expect(transform.updated).toBe(true);
  });

  it("stores repeat randomization values in the cache", () => {
    const transform = new TextureTransform();

    transform.repeatRandomRotation = 0.25;
    transform.repeatRandomAlpha = 0.5;
    transform.repeatRandomBlur = 0.75;
    transform.repeatRandomOffset = 1.5;

    expect(Array.from(transform.repeatRandomCache)).toEqual([0.25, 0.5, 0.75, 1.5]);
  });
});
