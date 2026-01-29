import { BaseKernelFilter } from "./BaseKernelFilter";

/**
 * Sharpen filter
 * @extends {BaseKernelFilter}
 */
export class SharpenFilter extends BaseKernelFilter {
  /**
   * Creates an instance of SharpenFilter.
   * @constructor
   * @param {number} intensity
   * @param {number} mix
   */
  constructor(intensity, mix = 1) {
    super(intensity, mix);

    // prettier-ignore
    this.kernels = new Float32Array([
      0, -1,  0,
     -1,  5, -1,
      0, -1,  0,
    ]);
  }
}
