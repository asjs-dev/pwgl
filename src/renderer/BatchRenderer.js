import "../namespace.js";
import "./BaseRenderer.js";

AGL.BatchRenderer = class extends AGL.BaseRenderer {
  constructor(options) {
    options.config.locations = options.config.locations.concat([
      "aMt"
    ]);

    super(options);

    this._MAX_BATCH_ITEMS = options.maxBatchItems || 1;

    this._matrixBuffer = new AGL.Buffer(
      "aMt", this._MAX_BATCH_ITEMS,
      4, 4
    );
  }

  _uploadBuffers() {
    this._matrixBuffer.upload(this._gl, this._enableBuffers, this._locations);
    super._uploadBuffers();
  }

  _createBuffers() {
    super._createBuffers();
    this._matrixBuffer.create(this._gl);
  }
}
