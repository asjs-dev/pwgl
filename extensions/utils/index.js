import {
  areTwoLinesCollided,
  areTwoRectsCollided,
  distanceBetweenPointAndLine,
  lineToLineIntersection,
  rectToRectIntersection,
} from "./collisionDetection";
import { getRandomFrom } from "./getRandomFrom";
import { coordToVector, vectorToCoord } from "./gridMapping";
import { hashNoise2D } from "./hashNoise2D";
import { stepNoise } from "./stepNoise";

export { areObjectsEqual } from "./areObjectsEqual";
export { arraySet } from "./arraySet";
export { clamp } from "./clamp";
export {
  areTwoLinesCollided,
  areTwoRectsCollided,
  distanceBetweenPointAndLine,
  lineToLineIntersection,
  rectToRectIntersection,
};
export { cross } from "./cross";
export { createStateMachine } from "./stateMachine";
export { dot } from "./dot";
export { generateDungeon } from "./dungeon";
export { enterFrame } from "./enterFrame";
export { enumCheck } from "./enumCheck";
export { FPSCounter } from "./FPSCounter";
export { fract } from "./fract";
export { getFPS } from "./getFPS";
export { getRandomFrom };
export { coordToVector, vectorToCoord };
export { hashNoise2D };
export { mix } from "./mix";
export { noop } from "./noop";
export { noopReturnsWith } from "./noopReturnsWith";
export { nthCall } from "./nthCall";
export { removeFromArray } from "./removeFromArray";
export { stepNoise };

export const collisionDetection = {
  distanceBetweenPointAndLine,
  areTwoLinesCollided,
  lineToLineIntersection,
  areTwoRectsCollided,
  rectToRectIntersection,
};

export const gridMapping = {
  coordToVector,
  vectorToCoord,
};

export const random = {
  getRandomFrom,
  hashNoise2D,
  stepNoise,
};
