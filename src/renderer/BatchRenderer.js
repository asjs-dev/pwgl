import { Buffer } from "../utils/Buffer";
import { BaseRenderer } from "./BaseRenderer";
import "../utils/Utils";

/**
 * @typedef {Object} BatchRendererConfig
 * @extends {RendererConfig}
 * @property {number} maxBatchItems
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
    options.config.locations = options.config.locations.concat([
      "aMt"
    ]);

    super(options);

    this.$MAX_BATCH_ITEMS = options.maxBatchItems || 1;

    this.$matrixBuffer = new Buffer("aMt", this.$MAX_BATCH_ITEMS, 4, 4);
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
