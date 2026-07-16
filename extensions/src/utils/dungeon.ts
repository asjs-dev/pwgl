import { areTwoRectsCollided } from "./collisionDetection";
import { getRandomFrom } from "./getRandomFrom";
import { coordToVector, vectorToCoord } from "./gridMapping";
import type { Rect, Vector2 } from "./types";

export type DungeonRoom = Rect & {
  data: number[];
};

export type DungeonLayout = {
  width: number;
  height: number;
  data: number[];
};

/** Generates a dungeon layout by randomly placing rooms and resolving collisions. */
export const generateDungeon = (iterations: number, sampleRooms: DungeonRoom[]): DungeonLayout => {
  const directions: Vector2[] = [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
  ];
  const rooms: DungeonRoom[] = [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < iterations; i++) {
    const direction = getRandomFrom(directions);
    const randomRoom = structuredClone(getRandomFrom(sampleRooms));

    if (Math.random() < 0.5) {
      randomRoom.data.reverse();
    }

    const room: DungeonRoom = { ...randomRoom, x: 0, y: 0 };
    let attempts = 100;

    while (attempts--) {
      let collision = false;

      for (const roomToTest of rooms) {
        if (areTwoRectsCollided(roomToTest, room)) {
          const rnd = Math.random() - 0.5;
          const randomPosition = Math.round((Math.random() - 0.5) * 2);

          room.x += direction.x ? (rnd >= 0 || !direction.y ? direction.x : randomPosition) : randomPosition;
          room.y += direction.y ? (rnd < 0 || !direction.x ? direction.y : randomPosition) : randomPosition;

          collision = true;
          break;
        }
      }

      if (!collision) {
        break;
      }
    }

    minX = Math.min(room.x, minX);
    minY = Math.min(room.y, minY);
    maxX = Math.max(room.x + room.width, maxX);
    maxY = Math.max(room.y + room.height, maxY);

    rooms.push(room);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const data = Array(width * height).fill(0);

  rooms.forEach(({ x, y, width: w, height: h, data: roomData }) => {
    const absX = x - minX;
    const absY = y - minY;

    roomData.forEach((value, index) => {
      const { x: px, y: py } = vectorToCoord(index, w);
      data[coordToVector(absX + px, absY + py, width)] = value;
    });
  });

  for (let i = 0, len = data.length - width; i < len; i++) {
    const { x: px, y: py } = vectorToCoord(i, width);

    if (px < width - 1 && data[i] > 0) {
      const bottomIdx = coordToVector(px, py + 1, width);
      const rightIdx = coordToVector(px + 1, py, width);
      const bottomRightIdx = coordToVector(px + 1, py + 1, width);
      const leftIdx = coordToVector(px - 1, py, width);
      const bottomLeftIdx = coordToVector(px - 1, py + 1, width);

      if (data[bottomIdx] === data[rightIdx] && data[i] === data[bottomRightIdx] && data[i] !== data[rightIdx]) {
        data[bottomIdx] = data[rightIdx] = 1;
      }

      if (px > 0 && data[bottomIdx] === data[leftIdx] && data[i] === data[bottomLeftIdx] && data[i] !== data[leftIdx]) {
        data[bottomIdx] = data[leftIdx] = 1;
      }
    }
  }

  return { width, height, data };
};
