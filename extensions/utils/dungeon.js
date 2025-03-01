export const generateDungeon = (iterations, sampleRooms) => {
  const directions = [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
  ];

  const rooms = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < iterations; i++) {
    const direction = getRandom(directions);
    const randomRoom = clone(getRandom(sampleRooms));

    if (Math.random() < 0.5) randomRoom.data.reverse();

    const room = { ...randomRoom, x: 0, y: 0 };
    let attempts = 100;

    while (attempts--) {
      let collision = false;

      for (const roomToTest of rooms) {
        if (
          areTwoRectsCollided(
            {
              x: roomToTest.x,
              y: roomToTest.y,
              width: roomToTest.x + roomToTest.width,
              height: roomToTest.y + roomToTest.height,
            },
            {
              x: room.x,
              y: room.y,
              width: room.x + room.width,
              height: room.y + room.height,
            }
          )
        ) {
          const rnd = Math.random() - 0.5;
          const randomPosition = Math.round((Math.random() - 0.5) * 2);
          room.x += direction.x
            ? rnd >= 0 || !direction.y
              ? direction.x
              : randomPosition
            : randomPosition;
          room.y += direction.y
            ? rnd < 0 || !direction.x
              ? direction.y
              : randomPosition
            : randomPosition;
          collision = true;
          break;
        }
      }

      if (!collision) break;
    }

    minX = Math.min(room.x, minX);
    minY = Math.min(room.y, minY);
    maxX = Math.max(room.x + room.width, maxX);
    maxY = Math.max(room.y + room.height, maxY);

    rooms.push(room);
  }

  const width = maxX - minX,
    height = maxY - minY;
  const data = Array(width * height).fill(0);

  rooms.forEach(({ x, y, width: w, height: h, data: roomData }) => {
    const absX = x - minX,
      absY = y - minY;
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

      if (
        data[bottomIdx] === data[rightIdx] &&
        data[i] === data[bottomRightIdx] &&
        data[i] !== data[rightIdx]
      ) {
        data[bottomIdx] = data[rightIdx] = 1;
      }

      if (
        px > 0 &&
        data[bottomIdx] === data[leftIdx] &&
        data[i] === data[bottomLeftIdx] &&
        data[i] !== data[leftIdx]
      ) {
        data[bottomIdx] = data[leftIdx] = 1;
      }
    }
  }

  return { width: width, height: height, data: data };
};
