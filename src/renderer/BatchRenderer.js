import { BaseRenderer } from "./BaseRenderer";
import { Buffer } from "../utils/Buffer";

/**
 * @typedef {Object} BatchRendererConfig
 * @extends {RendererConfig}
 */

/**
 * <pre>
 *  Batch Renderer
 *    - It renders multiple items
 * </pre>
 * @extends {BaseRenderer}
 */
export class BatchRenderer extends BaseRenderer {
  /**
   * Creates an instance of BatchRenderer.
   * @constructor
   * @param {RendererConfig} options
   */
  constructor(options) {
    // prettier-ignore
    options.config.locations = [
      ...options.config.locations,
      "aMt"
    ];

    super(options);

    this.$MAX_RENDER_COUNT = options.maxRenderCount || 10000;

    this.$matrixBuffer = new Buffer("aMt", this.$MAX_RENDER_COUNT, 4, 4);
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this.$matrixBuffer.upload(this.$gl, this.$enableBuffers);
    super.$uploadBuffers();
  }

  /**
   * @ignore
   */
  $createBuffers() {
    super.$createBuffers();
    this.$matrixBuffer.create(this.$gl, this.$locations);
  }
}
