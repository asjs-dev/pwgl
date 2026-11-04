import { BaseFilter } from "./BaseFilter";

// [x, y, kernel cell] of the eight neighbour taps; the centre uses the already sampled oCl.
const _TAPS = [
  [-1, -1, "[0].x"],
  [0, -1, "[0].y"],
  [1, -1, "[0].z"],
  [-1, 0, "[1].x"],
  [1, 0, "[1].z"],
  [-1, 1, "[2].x"],
  [0, 1, "[2].y"],
  [1, 1, "[2].z"],
];

/**
 * Builds a 3x3 convolution GLSL branch. Neighbour taps are clamped to the texture edge.
 * @param {string} kernelExpression - GLSL mat3 expression assigned to the kernel
 * @returns {string}
 * @ignore
 */
export const createKernelGLSL = (kernelExpression) =>
  // prettier-ignore
  `mat3 ` +
    `kr=${kernelExpression};` +
  `ivec2 ` +
    `km=ivec2(ts)-1;` +
  `oCl.rgb=(` +
    `oCl*kr[1].y+` +
    _TAPS.map(([x, y, cell]) => `texelFetch(uB,clamp(f+ivec2(${x},${y}),ivec2(0),km),0)*kr${cell}`).join("+") +
  `).rgb;`;

const _GLSL = createKernelGLSL("uK*v");

/**
 * Base kernel filter
 * @extends {BaseFilter}
 */
export class BaseKernelFilter extends BaseFilter {
  get GLSL() {
    return _GLSL;
  }
}
