import type { Vector2 } from "./types";

export type IsoCoordinates = Vector2 & { z?: number };
export type IsoItem = Vector2 & { z: number; gridX: number; gridY: number };

export type IsoUtils = {
  toIsoCoordinates: (coords?: IsoCoordinates) => Vector2;
  getIsoItemByCoordinates: (isoItems: IsoItem[], coords?: Vector2) => IsoItem | undefined;
};

export const createIsoUtils = (size: number): IsoUtils => {
  const halfSize = size * 0.5;
  const quarterSize = size * 0.25;

  const isInIsoRect = (isoItem: Vector2, point: Vector2): boolean => {
    const targetPoint: Vector2 = { x: point.x - isoItem.x + halfSize, y: point.y - isoItem.y };
    const dif: Vector2 = { x: Math.abs(halfSize - targetPoint.x), y: Math.abs(quarterSize - targetPoint.y) };
    return dif.x <= halfSize && dif.y <= quarterSize && dif.y <= quarterSize - dif.x * 0.5;
  };

  const toIsoCoordinates = ({ x = 0, y = 0, z = 0 }: IsoCoordinates = { x: 0, y: 0 }): Vector2 => {
    return {
      x: (x - y) * halfSize,
      y: (x + y) * quarterSize - z,
    };
  };

  return {
    toIsoCoordinates,
    getIsoItemByCoordinates: (isoItems: IsoItem[], point: Vector2 = { x: 0, y: 0 }) => {
      let i = isoItems.length;
      let isoItem: IsoItem | undefined;
      let zOrder = -Infinity;

      while (i--) {
        const item = isoItems[i];
        const itemZOrder = item.gridX + item.gridY;

        if (itemZOrder > zOrder && isInIsoRect(item, point)) {
          isoItem = item;
          zOrder = itemZOrder;
        }
      }

      return isoItem;
    },
  };
};
