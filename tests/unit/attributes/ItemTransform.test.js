import { describe, expect, it } from "vitest";
import { ItemTransform } from "../../../src/attributes/ItemTransform";

describe("ItemTransform", () => {
  it("updates scaled size from width, height and scale", () => {
    const transform = new ItemTransform();

    transform.width = 10;
    transform.height = 20;
    transform.scaleX = 3;
    transform.scaleY = 4;
    transform.update();

    expect(transform.scaledWidth).toBe(30);
    expect(transform.scaledHeight).toBe(80);
    expect(transform.updated).toBe(true);
  });

  it("does not report a fresh update twice without changes", () => {
    const transform = new ItemTransform();

    transform.update();
    expect(transform.updated).toBeUndefined();

    transform.width = 5;
    transform.update();
    expect(transform.updated).toBe(true);

    transform.update();
    expect(transform.updated).toBe(false);
  });

  it("updates each scaled axis independently", () => {
    const transform = new ItemTransform();

    transform.width = 12;
    transform.height = 7;
    transform.scaleX = 0.5;
    transform.scaleY = 3;
    transform.update();

    expect(transform.scaledWidth).toBe(6);
    expect(transform.scaledHeight).toBe(21);
  });
});
