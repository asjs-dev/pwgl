import { BaseKernelFilter } from "./BaseKernelFilter";

/**
 * Edge detect filter
 * @extends {BaseKernelFilter}
 */
export class EdgeDetectFilter extends BaseKernelFilter {
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
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
      ]
    });
  }
}
