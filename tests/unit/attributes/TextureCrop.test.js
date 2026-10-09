import { describe, expect, it } from "vitest";
import { TextureCrop } from "../../../src/attributes/TextureCrop";
import { expectCloseArray } from "../helpers/assertions";

describe("TextureCrop", () => {
  it("initializes to a full texture crop", () => {
    const crop = new TextureCrop();

    expectCloseArray(expect, crop.cache, [0, 0, 1, 1]);
  });

  it("stores x/y and width/height as the raw top-left and bottom-right points", () => {
    const crop = new TextureCrop();

    crop.x = 0.2;
    crop.y = 0.1;
    crop.width = 0.8;
    crop.height = 0.9;

    expectCloseArray(expect, crop.cache, [0.2, 0.1, 0.8, 0.9]);
  });

  it("accepts rectangle objects via setRect", () => {
    const crop = new TextureCrop();

    crop.setRect({ x: 10, y: 20, width: 40, height: 70 });

    expectCloseArray(expect, crop.cache, [10, 20, 40, 70]);
  });
});
