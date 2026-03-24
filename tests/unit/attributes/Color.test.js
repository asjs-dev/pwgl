import { describe, expect, it } from "vitest";
import { Color } from "../../../src/attributes/Color";
import { expectCloseArray } from "../helpers/assertions";

describe("Color", () => {
  it("stores rgba values in its cache", () => {
    const color = new Color();

    color.set(0.1, 0.2, 0.3, 0.4);

    expectCloseArray(expect, color.cache, [0.1, 0.2, 0.3, 0.4]);
  });

  it("tracks when a channel changes", () => {
    const color = new Color();

    color.update();
    expect(color.updated).toBe(true);

    color.update();
    expect(color.updated).toBe(false);

    color.r = 0.5;
    color.update();
    expect(color.updated).toBe(true);
    expect(color.r).toBe(0.5);
  });
});
