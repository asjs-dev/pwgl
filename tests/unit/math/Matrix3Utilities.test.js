import { describe, expect, it } from "vitest";
import { ItemTransform } from "../../../src/attributes/ItemTransform";
import { Matrix3Utilities } from "../../../src/math/Matrix3Utilities";
import { expectCloseArray } from "../helpers/assertions";

describe("Matrix3Utilities", () => {
  it("creates an identity matrix", () => {
    expectCloseArray(expect, Matrix3Utilities.identity(), [1, 0, 0, 1, 0, 0]);
  });

  it("updates a projection matrix from the resolution", () => {
    const matrix = Matrix3Utilities.identity();

    Matrix3Utilities.projection(matrix, { width: 200, height: 100 });

    expectCloseArray(expect, matrix, [0.01, 0, 0, -0.02, -1, 1]);
  });

  it("calculates local transforms from an item transform", () => {
    const matrix = Matrix3Utilities.identity();
    const transform = new ItemTransform();

    transform.x = 10;
    transform.y = 20;
    transform.anchorX = 0.5;
    transform.anchorY = 0.25;
    transform.width = 100;
    transform.height = 40;
    transform.scaleX = 2;
    transform.scaleY = 3;
    transform.rotation = Math.PI / 2;
    transform.update();

    Matrix3Utilities.transformLocal(matrix, transform);

    expectCloseArray(expect, matrix, [0, 200, -120, 0, 40, -80]);
  });

  it("combines parent and local transforms", () => {
    const parentMatrix = new Float32Array([2, 0, 0, 3, 5, 7]);
    const destinationMatrix = Matrix3Utilities.identity();
    const transform = new ItemTransform();

    transform.x = 4;
    transform.y = 5;
    transform.anchorX = 0.5;
    transform.anchorY = 0.25;
    transform.width = 10;
    transform.height = 20;
    transform.scaleX = 3;
    transform.scaleY = 2;
    transform.update();

    Matrix3Utilities.transform(destinationMatrix, parentMatrix, transform);

    expectCloseArray(expect, destinationMatrix, [60, 0, 0, 120, -17, -8]);
  });

  it("creates an inverse matrix", () => {
    const sourceMatrix = new Float32Array([2, 0, 0, 4, 10, 20]);
    const destinationMatrix = Matrix3Utilities.identity();

    Matrix3Utilities.inverse(destinationMatrix, sourceMatrix);

    expectCloseArray(expect, destinationMatrix, [0.5, 0, 0, 0.25, -5, -5]);
  });

  it("checks whether a point lands inside the normalized quad", () => {
    const matrix = new Float32Array([1, 0, 0, 1, 0, 0]);

    expect(Matrix3Utilities.isPointInMatrix(matrix, { x: 0.25, y: 0.75 })).toBe(true);
    expect(Matrix3Utilities.isPointInMatrix(matrix, { x: 1.5, y: 0.5 })).toBe(false);
  });

  it("calculates screen-space corners from a matrix and resolution", () => {
    const corners = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
    const matrix = new Float32Array([1, 2, 3, 4, 0.5, -0.5]);
    const resolution = { widthHalf: 100, heightHalf: 50, height: 100 };

    Matrix3Utilities.calcCorners(corners, matrix, resolution);

    expect(corners).toEqual([
      { x: 150, y: 75 },
      { x: 550, y: -225 },
      { x: 451, y: -127 },
      { x: 253, y: -29 },
    ]);
  });
});
