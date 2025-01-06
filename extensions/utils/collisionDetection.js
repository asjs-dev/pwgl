import { cross } from "./cross";
import { dot } from "./dot";

const distanceBetweenPointAndLine = (p, l) => {
  const AB = { x: l.b.x - l.a.x, y: l.b.y - l.a.y },
    AP = { x: p.x - l.a.x, y: p.y - l.a.y },
    BP = { x: p.x - l.b.x, y: p.y - l.b.y },
    useAP = dot(AB, AP) < 0,
    useBP = dot(AB, BP) > 0;

  if (!useAP && !useBP) return Math.abs(cross(AB, AP)) / Math.hypot(AB.x, AB.y);

  const P = useAP ? AP : BP;
  return Math.hypot(P.x, P.y);
};

const areTwoLinesCollided = (lineA, lineB) => {
  const a = lineA.b.y - lineA.a.y,
    b = lineA.b.x - lineA.a.x,
    c = lineB.b.y - lineB.a.y,
    d = lineB.b.x - lineB.a.x,
    denom = b * c - d * a;

  if (denom !== 0) {
    const e = lineB.b.x - lineA.a.x,
      f = lineB.a.x - lineB.b.x,
      g = lineB.b.y - lineA.a.y,
      h = lineA.a.y - lineA.b.y,
      lambda = (c * e + f * g) / denom,
      gamma = (h * e + b * g) / denom;

    if (lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1)
      return {
        lambda: lambda,
        gamma: gamma,
      };
  }
};

const lineToLineIntersection = (lineA, lineB) => {
  const collisionData = areTwoLinesCollided(lineA, lineB);
  return collisionData
    ? {
        x: lineA.a.x + (lineA.b.x - lineA.a.x) * collisionData.lambda,
        y: lineA.a.y + (lineA.b.y - lineA.a.y) * collisionData.lambda,
      }
    : null;
};

const areTwoRectsCollided = (rectA, rectB) =>
  rectA.width > rectB.x &&
  rectA.x < rectB.width &&
  rectA.height > rectB.y &&
  rectA.y < rectB.height;

const rectToRectIntersection = (rectA, rectB) =>
  areTwoRectsCollided(rectA, rectB)
    ? {
        x: Math.max(rectA.x, rectB.x),
        y: Math.max(rectA.y, rectB.y),
        width: Math.min(rectA.width, rectB.width),
        height: Math.min(rectA.height, rectB.height),
      }
    : null;

export const collisionDetection = {
  distanceBetweenPointAndLine,
  areTwoLinesCollided,
  lineToLineIntersection,
  areTwoRectsCollided,
  rectToRectIntersection,
};
