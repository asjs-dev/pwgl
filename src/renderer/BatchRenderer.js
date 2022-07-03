import { Buffer } from "../utils/Buffer.js";
import { BaseRenderer } from "./BaseRenderer.js";

export class BatchRenderer extends BaseRenderer {
  constructor(options) {
    options.config.locations = options.config.locations.concat([
      "aMt"
    ]);

    super(options);

    this._MAX_BATCH_ITEMS = options.maxBatchItems || 1;

    this._matrixBuffer = new Buffer(
      "aMt", this._MAX_BATCH_ITEMS,
      4, 4
    );
  }

  _uploadBuffers() {
    this._matrixBuffer.upload(this._gl, this._enableBuffers);
    super._uploadBuffers();
  }

  _createBuffers() {
    super._createBuffers();
    this._matrixBuffer.create(this._gl, this._locations);
  }
}
