import { describe, expect, it } from "vitest";
import { getCanvasPointerPosition } from "../../../src/utils/pointerUtils";

const createCanvas = () => ({
  width: 200,
  height: 100,
  offsetWidth: 100,
  offsetHeight: 50,
  getBoundingClientRect: () => ({
    left: 10,
    top: 20,
    width: 100,
    height: 50,
  }),
});

describe("pointerUtils", () => {
  it("maps mouse client coordinates to canvas coordinates", () => {
    expect(getCanvasPointerPosition(createCanvas(), { clientX: 35, clientY: 45 })).toEqual({ x: 50, y: 50 });
  });

  it("maps touch coordinates from active touches", () => {
    expect(getCanvasPointerPosition(createCanvas(), { touches: [{ clientX: 60, clientY: 30 }] })).toEqual({
      x: 100,
      y: 20,
    });
  });

  it("maps touch coordinates from changed touches", () => {
    expect(getCanvasPointerPosition(createCanvas(), { changedTouches: [{ clientX: 20, clientY: 25 }] })).toEqual({
      x: 20,
      y: 10,
    });
  });
});
