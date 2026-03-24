import { describe, expect, it } from "vitest";
import { layoutText } from "../../../src/utils/layoutText";

const createMockContext = () => ({
  measureText: (text) => ({ width: text.length }),
});

describe("layoutText", () => {
  it("keeps short text on one line", () => {
    const lines = layoutText(createMockContext(), "hello world", 20);

    expect(lines).toEqual(["hello world"]);
  });

  it("wraps at spaces when the line would exceed the maximum width", () => {
    const lines = layoutText(createMockContext(), "hello world from pwgl", 11);

    expect(lines).toEqual(["hello world", "from pwgl"]);
  });

  it("preserves blank lines between paragraphs", () => {
    const lines = layoutText(createMockContext(), "first\n\nthird", 20);

    expect(lines).toEqual(["first", "", "third"]);
  });

  it("splits long words character by character when needed", () => {
    const lines = layoutText(createMockContext(), "abcdefgh", 3);

    expect(lines).toEqual(["abc", "def", "gh"]);
  });

  it("tries to split hyphenated words at separators first", () => {
    const lines = layoutText(createMockContext(), "alpha-beta-gamma", 6);

    expect(lines).toEqual(["alpha-", "beta-", "gamma"]);
  });
});
