import { BaseKernelFilter, createKernelGLSL } from "./BaseKernelFilter";

// intensity 0 = identity kernel (unchanged), 1 = full sharpen kernel, >1 = stronger.
const _GLSL = createKernelGLSL("uK*v+mat3(0,0,0,0,1.-v,0,0,0,0)");

/**
 * Sharpen filter
 * @extends {BaseKernelFilter}
 */
export class SharpenFilter extends BaseKernelFilter {
  /**
   * Creates an instance of SharpenFilter.
   * @constructor
   * @param {object} options
   * @param {number} options.intensity - Default value 1 <br>
   *                                   - 0 leaves the image unchanged, 1 is the full sharpen kernel, above 1 is stronger
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

  get GLSL() {
    return _GLSL;
  }
}
