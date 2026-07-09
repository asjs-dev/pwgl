import { describe, expect, it, vi } from "vitest";
import { areObjectsEqual } from "../../../../extensions/utils/areObjectsEqual";
import { arraySet } from "../../../../extensions/utils/arraySet";
import { clamp } from "../../../../extensions/utils/clamp";
import {
  areTwoLinesCollided,
  areTwoRectsCollided,
  distanceBetweenPointAndLine,
  lineToLineIntersection,
  rectToRectIntersection,
} from "../../../../extensions/utils/collisionDetection";
import { cross } from "../../../../extensions/utils/cross";
import { dot } from "../../../../extensions/utils/dot";
import { enumCheck } from "../../../../extensions/utils/enumCheck";
import { fract } from "../../../../extensions/utils/fract";
import { getRandomFrom } from "../../../../extensions/utils/getRandomFrom";
import { coordToVector, vectorToCoord } from "../../../../extensions/utils/gridMapping";
import { hashNoise2D } from "../../../../extensions/utils/hashNoise2D";
import { mix } from "../../../../extensions/utils/mix";
import { noop } from "../../../../extensions/utils/noop";
import { noopReturnsWith } from "../../../../extensions/utils/noopReturnsWith";
import { removeFromArray } from "../../../../extensions/utils/removeFromArray";
import { createStateMachine } from "../../../../extensions/utils/stateMachine";
import { stepNoise } from "../../../../extensions/utils/stepNoise";

const flushMicrotasks = () => Promise.resolve();

describe("extensions basic utils", () => {
  it("compares nested objects deeply", () => {
    expect(areObjectsEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(areObjectsEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(areObjectsEqual({ "": 1 }, { "": 2 })).toBe(false);
  });

  it("copies values into arrays with an offset", () => {
    const target = [0, 0, 0, 0];
    arraySet(target, [7, 8], 1);
    expect(target).toEqual([0, 7, 8, 0]);
  });

  it("clamps values between bounds", () => {
    expect(clamp(0, 10, -5)).toBe(0);
    expect(clamp(0, 10, 15)).toBe(10);
    expect(clamp(0, 10, 6)).toBe(6);
  });

  it("computes vector math helpers", () => {
    expect(cross({ x: 2, y: 3 }, { x: 4, y: 5 })).toBe(-2);
    expect(dot({ x: 2, y: 3 }, { x: 4, y: 5 })).toBe(23);
  });

  it("calculates line and rect collisions", () => {
    const lineA = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const lineB = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    const rectA = { x: 0, y: 0, width: 10, height: 10 };
    const rectB = { x: 5, y: 5, width: 15, height: 15 };

    expect(distanceBetweenPointAndLine({ x: 5, y: 2 }, { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } })).toBe(2);
    expect(distanceBetweenPointAndLine({ x: 3, y: 4 }, { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } })).toBe(5);
    expect(areTwoLinesCollided(lineA, lineB)).toEqual({ lambda: 0.5, gamma: 0.5 });
    expect(lineToLineIntersection(lineA, lineB)).toEqual({ x: 5, y: 5 });
    expect(areTwoRectsCollided(rectA, rectB)).toBe(true);
    expect(areTwoRectsCollided(rectA, { x: 20, y: 20, width: 5, height: 5 })).toBe(false);
    expect(rectToRectIntersection(rectA, rectB)).toEqual({ x: 5, y: 5, width: 5, height: 5 });
  });

  it("tracks changes through the state machine", async () => {
    const machine = createStateMachine({
      initialState: { count: 1, nested: { enabled: true } },
      increment(state, amount = 1) {
        state.count += amount;
      },
      toggle(state) {
        state.nested.enabled = !state.nested.enabled;
      },
    });
    const listener = vi.fn();

    const unsubscribe = machine.subscribe(listener);

    expect(listener).toHaveBeenCalledWith({ count: 1, nested: { enabled: true } }, undefined);

    machine.increment(2);
    machine.toggle();

    expect(listener).toHaveBeenCalledTimes(1);

    await flushMicrotasks();

    expect(listener).toHaveBeenLastCalledWith(
      { count: 3, nested: { enabled: false } },
      { count: 1, nested: { enabled: true } },
    );

    unsubscribe();
    machine.increment();
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("exposes readonly state snapshots to subscribers", () => {
    const machine = createStateMachine({
      initialState: { nested: { value: 1 } },
      setNestedValue(state, value) {
        state.nested.value = value;
      },
    });
    let currentState;

    machine.subscribe((state) => {
      currentState = state;
    });

    expect(() => {
      currentState.nested.value = 2;
    }).toThrow("State is readonly.");
  });

  it("does not notify subscribers when an action explicitly returns false", async () => {
    const machine = createStateMachine({
      initialState: { count: 1 },
      keepCount(state) {
        state.count = 1;
        return false;
      },
    });
    const listener = vi.fn();

    machine.subscribe(listener);
    machine.keepCount();
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers when an action returns undefined", async () => {
    const machine = createStateMachine({
      initialState: { count: 1 },
      keepCount(state) {
        state.count = 1;
      },
    });
    const listener = vi.fn();

    machine.subscribe(listener);
    machine.keepCount();
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({ count: 1 }, { count: 1 });
  });

  it("handles enum and numeric helper utilities", () => {
    expect(enumCheck(0b110, 0b010)).toBe(true);
    expect(fract(3.75)).toBeCloseTo(0.75);
    expect(mix(0, 10, 0.25)).toBe(7.5);
  });

  it("maps between grid coordinates and vector indices", () => {
    expect(coordToVector(2, 3, 10)).toBe(32);
    expect(vectorToCoord(32, 10)).toEqual({ x: 2, y: 3 });
  });

  it("returns deterministic values when randomness is stubbed", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.49);

    expect(getRandomFrom(["a", "b", "c"])).toBe("b");
    expect(hashNoise2D(1, 2, 3)).toBeGreaterThanOrEqual(0);
    expect(hashNoise2D(1, 2, 3)).toBeLessThanOrEqual(1);
    expect(stepNoise(1, 2, 3)).toBeGreaterThanOrEqual(0);
    expect(stepNoise(1, 2, 3)).toBeLessThanOrEqual(1);

    randomSpy.mockRestore();
  });

  it("exposes noop helpers and removes items from arrays", () => {
    const fn = noopReturnsWith(42);
    const items = [1, 2, 3];

    expect(noop()).toBeUndefined();
    expect(fn()).toBe(42);

    removeFromArray(items, 2);
    expect(items).toEqual([1, 3]);
  });
});
