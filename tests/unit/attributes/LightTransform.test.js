import { describe, expect, it } from "vitest";
import { LightTransform } from "../../../src/attributes/LightTransform";

describe("LightTransform", () => {
  it("keeps width and height in sync", () => {
    const transform = new LightTransform();

    transform.width = 12;
    transform.update();

    expect(transform.width).toBe(12);
    expect(transform.height).toBe(12);
    expect(transform.scaledWidth).toBe(12);
    expect(transform.scaledHeight).toBe(12);
  });

  it("treats height assignment as width assignment", () => {
    const transform = new LightTransform();

    transform.height = 8;
    transform.scaleX = 2;
    transform.scaleY = 3;
    transform.update();

    expect(transform.width).toBe(8);
    expect(transform.height).toBe(8);
    expect(transform.scaledWidth).toBe(16);
    expect(transform.scaledHeight).toBe(24);
  });

  it("stores z position separately", () => {
    const transform = new LightTransform();

    transform.z = 5;

    expect(transform.z).toBe(5);
  });
});
