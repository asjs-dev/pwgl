import { Buffer } from "../utils/Buffer";
import { BaseRenderer } from "./BaseRenderer";
import "../utils/Utils";

/**
 * @typedef {Object} BatchRendererConfig
 * @extends {RendererConfig}
 * @property {number} maxBatchItems
 */

/**
 * Batch Renderer
 *  - It renders multiple items
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

    this._MAX_BATCH_ITEMS = options.maxBatchItems || 1;

    this._matrixBuffer = new Buffer("aMt", this._MAX_BATCH_ITEMS, 4, 4);
  }

  /**
   * @ignore
   */
  _uploadBuffers() {
    this._matrixBuffer.upload(this._gl, this._enableBuffers);
    super._uploadBuffers();
  }

  /**
   * @ignore
   */
  _createBuffers() {
    super._createBuffers();
    this._matrixBuffer.create(this._gl, this._locations);
  }
}
