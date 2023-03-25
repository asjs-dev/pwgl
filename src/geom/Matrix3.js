export const Matrix3 = {
  identity: () => new Float32Array([1, 0, 0, 1, 0, 0]),
  projection: (width, height, destinationMatrix) => {
    destinationMatrix[0] = 2 / width;
    destinationMatrix[1] = destinationMatrix[2] = 0;
    destinationMatrix[3] = -2 / height;
    destinationMatrix[4] = -1;
    destinationMatrix[5] = 1;
  },
  transformLocal: (props, destinationMatrix) => {
    const anchorX = props.anchorX;
    const anchorY = props.anchorY;
    const scaledWidth = props.scaledWidth;
    const scaledHeight = props.scaledHeight;

    destinationMatrix[0] = props.cosRotationA * scaledWidth;
    destinationMatrix[1] = props.sinRotationA * scaledWidth;
    destinationMatrix[2] = -props.sinRotationB * scaledHeight;
    destinationMatrix[3] = props.cosRotationB * scaledHeight;
    destinationMatrix[4] =
      props.x - anchorX * destinationMatrix[0] - anchorY * destinationMatrix[2];
    destinationMatrix[5] =
      props.y - anchorX * destinationMatrix[1] - anchorY * destinationMatrix[3];
  },
  transform: (matrix, props, destinationMatrix) => {
    const x = props.x;
    const y = props.y;
    const anchorX = props.anchorX;
    const anchorY = props.anchorY;
    const sinRotationA = props.sinRotationA;
    const sinRotationB = props.sinRotationB;
    const cosRotationA = props.cosRotationA;
    const cosRotationB = props.cosRotationB;
    const scaledWidth = props.scaledWidth;
    const scaledHeight = props.scaledHeight;

    destinationMatrix[0] =
      (cosRotationA * matrix[0] + sinRotationA * matrix[2]) * scaledWidth;
    destinationMatrix[1] =
      (cosRotationA * matrix[1] + sinRotationA * matrix[3]) * scaledWidth;
    destinationMatrix[2] =
      (cosRotationB * matrix[2] - sinRotationB * matrix[0]) * scaledHeight;
    destinationMatrix[3] =
      (cosRotationB * matrix[3] - sinRotationB * matrix[1]) * scaledHeight;

    destinationMatrix[4] =
      -anchorX * destinationMatrix[0] -
      anchorY * destinationMatrix[2] +
      x * matrix[0] +
      y * matrix[2] +
      matrix[4];
    destinationMatrix[5] =
      -anchorX * destinationMatrix[1] -
      anchorY * destinationMatrix[3] +
      x * matrix[1] +
      y * matrix[3] +
      matrix[5];
  },
  inverse: (matrix, destinationMatrix) => {
    const det = 1 / (matrix[0] * matrix[3] - matrix[2] * matrix[1]);

    destinationMatrix[0] = det * matrix[3];
    destinationMatrix[1] = -det * matrix[1];
    destinationMatrix[2] = -det * matrix[2];
    destinationMatrix[3] = det * matrix[0];
    destinationMatrix[4] =
      det * (matrix[2] * matrix[5] - matrix[3] * matrix[4]);
    destinationMatrix[5] =
      -det * (matrix[0] * matrix[5] - matrix[1] * matrix[4]);
  },
  isPointInMatrix: (matrix, point) => {
    const x = point.x * matrix[0] + point.y * matrix[2] + matrix[4];
    const y = point.x * matrix[1] + point.y * matrix[3] + matrix[5];

    return x >= 0 && x <= 1 && y >= 0 && y <= 1;
  },
  calcCorners: (matrix, corners, resolution) => {
    const widthHalf = resolution.widthHalf;
    const heightHalf = resolution.heightHalf;

    corners[0].x = widthHalf + matrix[4] * widthHalf;
    corners[0].y = resolution.height - (heightHalf + matrix[5] * heightHalf);
    corners[1].x = corners[0].x + (matrix[0] + matrix[2]) * widthHalf;
    corners[1].y = corners[0].y - (matrix[1] + matrix[3]) * heightHalf;
    corners[2].x = corners[0].x + (matrix[0] + widthHalf * matrix[2]);
    corners[2].y = corners[0].y - (matrix[1] + heightHalf * matrix[3]);
    corners[3].x = corners[0].x + (widthHalf * matrix[0] + matrix[2]);
    corners[3].y = corners[0].y - (heightHalf * matrix[1] + matrix[3]);
  },
};
