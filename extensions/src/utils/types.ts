export type Vector2 = {
  x: number;
  y: number;
};

export type Rect = Vector2 & {
  width: number;
  height: number;
};

export type LineSegment = {
  a: Vector2;
  b: Vector2;
};
