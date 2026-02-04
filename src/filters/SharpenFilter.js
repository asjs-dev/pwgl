import { BaseKernelFilter } from "./BaseKernelFilter";
/**
 * Sharpen filter
 * @extends {BaseKernelFilter}
 */
export class SharpenFilter extends BaseKernelFilter {
  /**
   * Creates an instance of EdgeDetectFilter.
   * @constructor
   * @param {object} options
   */
  constructor(options) {
    // prettier-ignore
    super({
      ...options,
      kernels: [
        0, -1,  0,
       -1,  5, -1,
        0, -1,  0
      ]
    });
  }
}
