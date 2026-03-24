import { describe, expect, it } from "vitest";
import { TextureCrop } from "../../../src/attributes/TextureCrop";
import { expectCloseArray } from "../helpers/assertions";

describe("TextureCrop", () => {
  it("initializes to a full texture crop", () => {
    const crop = new TextureCrop();

    crop.update();

    expectCloseArray(expect, crop.cache, [0, 0, 1, 1]);
    expect(crop.updated).toBe(true);
  });

  it("recomputes width and height offsets from the crop origin", () => {
    const crop = new TextureCrop();

    crop.x = 0.2;
    crop.y = 0.1;
    crop.width = 0.8;
    crop.height = 0.9;
    crop.update();

    expectCloseArray(expect, crop.cache, [0.2, 0.1, 0.6, 0.8]);
  });

  it("accepts rectangle objects via setRect", () => {
    const crop = new TextureCrop();

    crop.setRect({ x: 10, y: 20, width: 40, height: 70 });
    crop.update();

    expectCloseArray(expect, crop.cache, [10, 20, 30, 50]);
  });

  it("does not report changes twice without updates", () => {
    const crop = new TextureCrop();

    crop.update();
    expect(crop.updated).toBe(true);

    crop.update();
    expect(crop.updated).toBe(false);
  });
});
