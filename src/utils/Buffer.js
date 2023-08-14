import { Const } from "./Utils";

/**
 * Buffer
 */
export class Buffer {
  /**
   * Creates an instance of Buffer.
   * @constructor
   * @param {string} locationName
   * @param {any} data
   * @param {number} rows
   * @param {number} cols
   * @param {number} target
   * @param {number} type
   * @param {number} divisor
   */
  constructor(locationName, data, rows, cols, target, type, divisor = 1) {
    const length = rows * cols;

    this.data =
      typeof data === "number" ? new Float32Array(data * length) : data;
    this._locationName = locationName;
    this._rows = rows;
    this._cols = cols;
    this._target = target ?? Const.ARRAY_BUFFER;
    this._type = type ?? Const.DYNAMIC_DRAW;
    this._length = length * 4;
    this._offset = cols * 4;
    this._divisor = divisor;

    if (this._type === Const.STATIC_DRAW) this._length = this._offset = 0;
  }

  /**
   * Create and binf buffer
   * @param {WebGLContext} gl
   * @param {Object} locations
   */
  create(gl, locations) {
    this._location = locations[this._locationName];
    this._buffer = gl.createBuffer();
    this.bind(gl);
  }

  /**
   * binf buffer
   * @param {WebGLContext} gl
   */
  bind(gl) {
    gl.bindBuffer(this._target, this._buffer);
  }

  /**
   * Upload buffer
   * @param {WebGLContext} gl
   * @param {boolean} enable
   */
  upload(gl, enable) {
    this.bind(gl);
    enable && this._enable(gl);
    gl.bufferData(this._target, this.data, this._type);
  }

  /**
   * Destruct class
   */
  destruct() {
    this.data = null;
  }

  /**
   * @param {WebGLContext} gl
   * @ignore
   */
  _enable(gl) {
    let i = -1;
    while (++i < this._rows) {
      const loc = this._location + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(
        loc,
        this._cols,
        Const.FLOAT,
        false,
        this._length,
        i * this._offset
      );
      gl.vertexAttribDivisor(loc, this._divisor);
    }
  }
}
