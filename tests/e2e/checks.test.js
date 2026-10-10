import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let checks;

beforeAll(async () => {
  // checks.js hooks window error events on import.
  vi.stubGlobal("window", { addEventListener: vi.fn() });
  checks = await import("./checks.js");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("e2e checks helpers", () => {
  it("withTimeout resolves with the promise value when it settles in time", async () => {
    await expect(checks.withTimeout(Promise.resolve(42), 1000, "ready")).resolves.toBe(42);
  });

  it("withTimeout passes through a rejection", async () => {
    const error = new Error("failed");
    await expect(checks.withTimeout(Promise.reject(error), 1000, "ready")).rejects.toBe(error);
  });

  it("withTimeout rejects a never-settling promise after the timeout", async () => {
    vi.useFakeTimers();
    const result = checks.withTimeout(new Promise(() => {}), 5000, "ready");
    const assertion = expect(result).rejects.toThrow("ready timed out after 5000 ms");
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it("withTimeout clears its timer once the promise settles", async () => {
    vi.useFakeTimers();
    await checks.withTimeout(Promise.resolve(), 5000, "ready");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("destroyInstance disposes the case media before destructing the context", () => {
    const order = [];
    checks.destroyInstance({
      dispose: () => order.push("dispose"),
      context: { destruct: () => order.push("destruct") },
    });
    expect(order).toEqual(["dispose", "destruct"]);
  });

  it("destroyInstance still destructs the context when dispose throws", () => {
    const destruct = vi.fn();
    checks.destroyInstance({
      dispose: () => {
        throw new Error("dispose failed");
      },
      context: { destruct },
    });
    expect(destruct).toHaveBeenCalledOnce();
  });

  it("destroyInstance accepts instances without dispose and a missing instance", () => {
    const destruct = vi.fn();
    expect(() => checks.destroyInstance({ context: { destruct } })).not.toThrow();
    expect(destruct).toHaveBeenCalledOnce();
    expect(() => checks.destroyInstance(undefined)).not.toThrow();
  });
});
