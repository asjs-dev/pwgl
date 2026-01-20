import { cross } from "./cross";
import { dot } from "./dot";

/**
 * Calculates the shortest distance between a point and a line segment
 * @param {object} p The point with x and y properties
 * @param {object} l The line segment with a and b properties (each having x and y)
 * @returns {number} The shortest distance between the point and the line segment
 */
export const distanceBetweenPointAndLine = (p, l) => {
  const AB = { x: l.b.x - l.a.x, y: l.b.y - l.a.y },
    AP = { x: p.x - l.a.x, y: p.y - l.a.y },
    BP = { x: p.x - l.b.x, y: p.y - l.b.y },
    useAP = dot(AB, AP) < 0,
    useBP = dot(AB, BP) > 0;

  if (!useAP && !useBP) return Math.abs(cross(AB, AP)) / Math.hypot(AB.x, AB.y);

  const P = useAP ? AP : BP;
  return Math.hypot(P.x, P.y);
};

/**
 * Determines if two line segments are collided
 * @param {object} lineA The first line segment with a and b properties (each having x and y)
 * @param {object} lineB The second line segment with a and b properties (each having x and y)
 * @returns {object|undefined} An object with lambda and gamma properties if collided, otherwise undefined
 */
export const areTwoLinesCollided = (lineA, lineB) => {
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

/**
 * Calculates the intersection point of two line segments if they collide
 * @param {object} lineA The first line segment with a and b properties (each having x and y)
 * @param {object} lineB The second line segment with a and b properties (each having x and y)
 * @returns {object|null} The intersection point with x and y properties if collided, otherwise null
 */
export const lineToLineIntersection = (lineA, lineB) => {
  const collisionData = areTwoLinesCollided(lineA, lineB);
  return collisionData
    ? {
        x: lineA.a.x + (lineA.b.x - lineA.a.x) * collisionData.lambda,
        y: lineA.a.y + (lineA.b.y - lineA.a.y) * collisionData.lambda,
      }
    : null;
};

/**
 * Determines if two rectangles are collided
 * @param {object} rectA The first rectangle with x, y, width, and height properties
 * @param {object} rectB The second rectangle with x, y, width, and height properties
 * @returns {boolean} True if the rectangles are collided, otherwise false
 */
export const areTwoRectsCollided = (rectA, rectB) =>
  rectA.width > rectB.x &&
  rectA.x < rectB.width &&
  rectA.height > rectB.y &&
  rectA.y < rectB.height;

/**
 * Calculates the intersection rectangle of two rectangles if they collide
 * @param {object} rectA The first rectangle with x, y, width, and height properties
 * @param {object} rectB The second rectangle with x, y, width, and height properties
 * @returns {object|null} The intersection rectangle with x, y, width, and height properties if collided, otherwise null
 */
export const rectToRectIntersection = (rectA, rectB) =>
  areTwoRectsCollided(rectA, rectB)
    ? {
        x: Math.max(rectA.x, rectB.x),
        y: Math.max(rectA.y, rectB.y),
        width: Math.min(rectA.width, rectB.width),
        height: Math.min(rectA.height, rectB.height),
      }
    : null;
