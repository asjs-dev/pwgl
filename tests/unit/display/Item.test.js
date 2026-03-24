import { describe, expect, it, vi } from "vitest";
import { Item } from "../../../src/display/Item";
import { expectCloseArray } from "../helpers/assertions";

const createParent = (overrides = {}) => ({
  colorUpdated: false,
  transformUpdated: false,
  colorCache: new Float32Array([1, 1, 1, 1]),
  matrixCache: new Float32Array([1, 0, 0, 1, 0, 0]),
  callEventHandler: vi.fn(),
  removeChild: vi.fn(),
  stage: { id: "stage" },
  ...overrides,
});

describe("Item", () => {
  it("inherits stage from its parent", () => {
    const item = new Item();
    item.parent = createParent();

    expect(item.stage).toEqual({ id: "stage" });
  });

  it("updates color and transform caches from the parent", () => {
    const item = new Item();
    item.parent = createParent({
      colorUpdated: true,
      transformUpdated: true,
      colorCache: new Float32Array([0.5, 0.25, 1, 0.75]),
      matrixCache: new Float32Array([2, 0, 0, 2, 3, 4]),
    });

    item.color.set(0.2, 0.4, 0.5, 0.8);
    item.transform.x = 10;
    item.transform.y = 20;
    item.update();

    expectCloseArray(expect, item.colorCache, [0.1, 0.1, 0.5, 0.6]);
    expect(Array.from(item.matrixCache)).toEqual([2, 0, 0, 2, 23, 44]);
    expect(item.colorUpdated).toBe(true);
    expect(item.transformUpdated).toBe(true);
  });

  it("bubbles events to the parent when interactive", () => {
    const item = new Item();
    const parent = createParent();
    const handler = vi.fn();

    item.parent = parent;
    item.interactive = true;
    item.onPointerDown = handler;

    const event = { type: "PointerDown" };
    item.callEventHandler("target", event);

    expect(handler).toHaveBeenCalledWith(item, "target", event);
    expect(parent.callEventHandler).toHaveBeenCalledWith("target", event);
  });

  it("removes itself through the parent", () => {
    const item = new Item();
    const parent = createParent();

    item.parent = parent;
    item.remove();

    expect(parent.removeChild).toHaveBeenCalledWith(item);
  });
});
