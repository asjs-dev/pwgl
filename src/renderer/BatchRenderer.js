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
   * @param {RendererConfig} config
   */
  constructor(config) {
    // prettier-ignore
    config.locations = [
      ...config.locations,
      "aMt"
    ];

    super(config);

    this.$MAX_RENDER_COUNT = config.maxRenderCount || 10000;

    this.$matrixBuffer = new Buffer("aMt", this.$MAX_RENDER_COUNT, 4, 4);
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this.$matrixBuffer.upload(this.$gl);
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
