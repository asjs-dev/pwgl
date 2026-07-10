import { describe, expect, it, vi } from "vitest";
import { generateDungeon } from "../../../../extensions/src/utils/dungeon";

describe("extensions dungeon", () => {
  it("generates a dungeon grid from sample rooms deterministically", () => {
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const sampleRooms = [
      {
        width: 2,
        height: 2,
        data: [1, 1, 1, 1],
      },
      {
        width: 1,
        height: 2,
        data: [2, 2],
      },
    ];

    const dungeon = generateDungeon(2, sampleRooms);

    expect(dungeon.width).toBeGreaterThan(0);
    expect(dungeon.height).toBeGreaterThan(0);
    expect(dungeon.data).toHaveLength(dungeon.width * dungeon.height);
    expect(dungeon.data.some((value) => value > 0)).toBe(true);

    randomSpy.mockRestore();
  });
});
