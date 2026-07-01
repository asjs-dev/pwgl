import { describe, expect, it } from "vitest";
import { SHOW_ARRAYS, SHOW_CALL_STACKS, SHOW_ORIGINAL_VALUES } from "../../../debugger/src/constants";

describe("debugger constants", () => {
  it("exports stable bitmask flags", () => {
    expect(SHOW_CALL_STACKS).toBe(1);
    expect(SHOW_ORIGINAL_VALUES).toBe(2);
    expect(SHOW_ARRAYS).toBe(4);
  });
});
