import { describe, expect, it } from "vitest";
import { Container } from "../../../src/display/Container";
import { Item } from "../../../src/display/Item";

const createChild = (bounds) => {
  const child = new Item();
  child.getBounds = () => bounds;
  return child;
};

describe("Container", () => {
  it("adds, reorders and removes children", () => {
    const container = new Container();
    const childA = new Item();
    const childB = new Item();

    container.addChild(childA);
    container.addChildAt(childB, 0);

    expect(container.getChildAt(0)).toBe(childB);
    expect(container.getChildAt(1)).toBe(childA);
    expect(container.contains(childA)).toBe(true);

    container.swapChildren(childA, childB);
    expect(container.getChildAt(0)).toBe(childA);
    expect(container.getChildAt(1)).toBe(childB);

    container.removeChild(childA);
    expect(container.contains(childA)).toBe(false);
    expect(childA.parent).toBe(null);
  });

  it("computes premultiplied alpha and tint from the parent chain", () => {
    const root = new Container();
    const child = new Container();

    root.parent = null;
    root.alpha = 0.5;
    root.useTint = 0.25;
    child.alpha = 0.2;
    child.useTint = 0.4;

    child.parent = root;

    expect(child.getPremultipliedAlpha()).toBeCloseTo(0.1);
    expect(child.getPremultipliedUseTint()).toBeCloseTo(0.1);
  });

  it("aggregates bounds from all children", () => {
    const container = new Container();

    container.addChild(createChild({ x: 10, y: 20, width: 30, height: 40 }));
    container.addChild(createChild({ x: 5, y: 25, width: 35, height: 50 }));

    expect(container.getBounds()).toEqual({ x: 5, y: 20, width: 35, height: 50 });
  });

  it("empties the container during destruct", () => {
    const container = new Container();
    const child = new Item();

    container.addChild(child);
    container.destruct();

    expect(container.children).toEqual([]);
    expect(child.parent).toBe(null);
  });
});
