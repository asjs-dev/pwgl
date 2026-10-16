import { ItemTransform } from "../attributes/ItemTransform";
import "./PointType";

// prettier-ignore
const UNIT_QUAD = [
  0, 0,
  1, 0,
  1, 1,
  0, 1
];

/**
 * @typedef {Float32Array} Matrix3
 */

/**
 * Matrix calculation utilities
 * @typedef {Object} Matrix3Utilities
 * @property {function():Matrix3} identity Create irentity matrix
 * @property {function(Matrix3, Object)} projection Update projection matrix
 * @property {function(ItemTransform, Matrix3)} transformLocal Calculate local transformation
 * @property {function(Matrix3, ItemTransform, Matrix3)} transform Calculate global transformation
 * @property {function(Matrix3, Matrix3)} inverse Create inverse matrix
 * @property {function(matrix, Point):boolean} isPointInMatrix  Returns true if the point in the matrix
 * @property {function(Array<Point>, Matrix3, Object, Array<number>=)} calcCorners Calculate screen-space corners
 */
export const Matrix3Utilities = {
  /**
   * Create irentity matrix
   * @returns {Matrix3}
   */
  identity: () => new Float32Array([1, 0, 0, 1, 0, 0]),

  /**
   * Update projection matrix
   * @param {Matrix3} destinationMatrix
   * @param {Object} resolution
   * @param {number} resolution.width
   * @param {number} resolution.height
   */
  projection: (destinationMatrix, resolution) => {
    destinationMatrix[0] = 2 / resolution.width;
    destinationMatrix[1] = destinationMatrix[2] = 0;
    destinationMatrix[3] = -2 / resolution.height;
    destinationMatrix[4] = -1;
    destinationMatrix[5] = 1;
  },

  /**
   * Calculate local transformation
   * @param {Matrix3} destinationMatrix
   * @param {ItemTransform} itemTransform
   */
  transformLocal: (destinationMatrix, itemTransform) => {
    const { anchorX, anchorY, scaledWidth, scaledHeight } = itemTransform;

    destinationMatrix[0] = itemTransform.cosRotationA * scaledWidth;
    destinationMatrix[1] = itemTransform.sinRotationA * scaledWidth;
    destinationMatrix[2] = -itemTransform.sinRotationB * scaledHeight;
    destinationMatrix[3] = itemTransform.cosRotationB * scaledHeight;
    destinationMatrix[4] = itemTransform.x - anchorX * destinationMatrix[0] - anchorY * destinationMatrix[2];
    destinationMatrix[5] = itemTransform.y - anchorX * destinationMatrix[1] - anchorY * destinationMatrix[3];
  },

  /**
   * Calculate global transformation
   * @param {Matrix3} destinationMatrix
   * @param {Matrix3} matrix
   * @param {ItemTransform} itemTransform
   */
  transform: (destinationMatrix, matrix, itemTransform) => {
    const {
      x,
      y,
      anchorX,
      anchorY,
      sinRotationA,
      sinRotationB,
      cosRotationA,
      cosRotationB,
      scaledWidth,
      scaledHeight,
    } = itemTransform;

    destinationMatrix[0] = (cosRotationA * matrix[0] + sinRotationA * matrix[2]) * scaledWidth;
    destinationMatrix[1] = (cosRotationA * matrix[1] + sinRotationA * matrix[3]) * scaledWidth;
    destinationMatrix[2] = (cosRotationB * matrix[2] - sinRotationB * matrix[0]) * scaledHeight;
    destinationMatrix[3] = (cosRotationB * matrix[3] - sinRotationB * matrix[1]) * scaledHeight;

    // prettier-ignore
    destinationMatrix[4] =
      -anchorX * destinationMatrix[0] -
      anchorY * destinationMatrix[2] +
      x * matrix[0] +
      y * matrix[2] +
      matrix[4];

    // prettier-ignore
    destinationMatrix[5] =
      -anchorX * destinationMatrix[1] -
      anchorY * destinationMatrix[3] +
      x * matrix[1] +
      y * matrix[3] +
      matrix[5];
  },

  /**
   * Create inverse matrix
   * @param {Matrix3} destinationMatrix
   * @param {Matrix3} matrix
   */
  inverse: (destinationMatrix, matrix) => {
    const det = 1 / (matrix[0] * matrix[3] - matrix[2] * matrix[1]);

    destinationMatrix[0] = det * matrix[3];
    destinationMatrix[1] = -det * matrix[1];
    destinationMatrix[2] = -det * matrix[2];
    destinationMatrix[3] = det * matrix[0];
    destinationMatrix[4] = det * (matrix[2] * matrix[5] - matrix[3] * matrix[4]);
    destinationMatrix[5] = -det * (matrix[0] * matrix[5] - matrix[1] * matrix[4]);
  },

  /**
   * Returns true if the point in the matrix
   * @param {Matrix3} matrix
   * @param {Point} point
   * @returns {boolean}
   */
  isPointInMatrix: (matrix, point) => {
    const x = point.x * matrix[0] + point.y * matrix[2] + matrix[4];
    const y = point.x * matrix[1] + point.y * matrix[3] + matrix[5];

    return x >= 0 && x <= 1 && y >= 0 && y <= 1;
  },

  /**
   * <pre>
   *  Calculate the screen-space corners of a transformed unit quad
   *    - Corner slot order: top left (0, 0), bottom right (1, 1), bottom left (0, 1), top right (1, 0)
   *    - Optional quad: 8 unit-quad coordinates in top left, top right, bottom right, bottom left
   *      order (Distortion.cache layout); omitted → the undistorted unit quad
   *    - Results are in pixels, y grows downwards
   * </pre>
   * @param {Array<Point>} corners
   * @param {Matrix3} matrix
   * @param {Object} resolution
   * @param {number} resolution.widthHalf
   * @param {number} resolution.heightHalf
   * @param {number} resolution.height
   * @param {Array<number>} [quad]
   */
  calcCorners: (corners, matrix, resolution, quad = UNIT_QUAD) => {
    const { widthHalf, heightHalf } = resolution;
    const x = widthHalf + matrix[4] * widthHalf;
    const y = resolution.height - (heightHalf + matrix[5] * heightHalf);

    const setCorner = (corner, u, v) => {
      corner.x = x + (u * matrix[0] + v * matrix[2]) * widthHalf;
      corner.y = y - (u * matrix[1] + v * matrix[3]) * heightHalf;
    };

    setCorner(corners[0], quad[0], quad[1]);
    setCorner(corners[3], quad[2], quad[3]);
    setCorner(corners[1], quad[4], quad[5]);
    setCorner(corners[2], quad[6], quad[7]);
  },
};
