import { cross } from "./cross";
import { dot } from "./dot";

export const distanceBetweenPointAndLine = (p, l) => {
  const AB = { x: l.b.x - l.a.x, y: l.b.y - l.a.y };
  const AP = { x: p.x - l.a.x, y: p.y - l.a.y };
  const BP = { x: p.x - l.b.x, y: p.y - l.b.y };

  const useAP = dot(AB, AP) < 0;
  const useBP = dot(AB, BP) > 0;

  if (!useAP && !useBP) return Math.abs(cross(AB, AP)) / Math.hypot(AB.x, AB.y);

  const P = useAP ? AP : BP;
  return Math.hypot(P.x, P.y);
};

export const areTwoLinesCollided = (lineA, lineB) => {
  const a = lineA.b.y - lineA.a.y;
  const b = lineA.b.x - lineA.a.x;
  const c = lineB.b.y - lineB.a.y;
  const d = lineB.b.x - lineB.a.x;

  const denom = b * c - d * a;

  if (denom !== 0) {
    const e = lineB.b.x - lineA.a.x;
    const f = lineB.a.x - lineB.b.x;
    const g = lineB.b.y - lineA.a.y;
    const h = lineA.a.y - lineA.b.y;

    const lambda = (c * e + f * g) / denom;
    const gamma = (h * e + b * g) / denom;

    if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1)
      return {
        lambda,
        gamma,
      };
  }

  return null;
};

export const lineToLineIntersection = (lineA, lineB) => {
  const collisionData = areTwoLinesCollided(lineA, lineB);
  return collisionData
    ? {
        x: lineA.a.x + (lineA.b.x - lineA.a.x) * collisionData.lambda,
        y: lineA.a.y + (lineA.b.y - lineA.a.y) * collisionData.lambda,
      }
    : null;
};

export const areTwoRectsCollided = (rectA, rectB) =>
  rectA.width > rectB.x &&
  rectA.x < rectB.width &&
  rectA.height > rectB.y &&
  rectA.y < rectB.height;

export const rectToRectIntersection = (rectA, rectB) =>
  areTwoRectsCollided(rectA, rectB)
    ? {
        x: Math.max(rectA.x, rectB.x),
        y: Math.max(rectA.y, rectB.y),
        width: Math.min(rectA.width, rectB.width),
        height: Math.min(rectA.height, rectB.height)
      }
    : null;
