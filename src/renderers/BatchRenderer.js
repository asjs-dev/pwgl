import { Buffer } from "../core/Buffer";
import { Utils } from "../core/Utils";
import { BaseRenderer } from "./BaseRenderer";

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
    Utils.setLocations(config, [
      "aB"
    ]);

    super(config);

    this.$MAX_RENDER_COUNT = config.maxRenderCount || 10000;
    this._batchItems = 0;

    // prettier-ignore
    this.$matrixBuffer = new Buffer(
      "aB",
      this.$MAX_RENDER_COUNT,
      4,
      4
    );
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this.$matrixBuffer.uploadElements(this.$gl, this._batchItems);
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
