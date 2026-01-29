import { BaseKernelFilter } from "./BaseKernelFilter";

/**
 * Edge detect filter
 * @extends {BaseKernelFilter}
 */
export class EdgeDetectFilter extends BaseKernelFilter {
  /**
   * Creates an instance of EdgeDetectFilter.
   * @constructor
   * @param {number} intensity
   */
  constructor(intensity, mix = 1) {
    super(intensity, mix);

    // prettier-ignore
    this.kernels = new Float32Array([
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1
    ]);
  }
}
