import { Const } from "./Utils";

/**
 * Buffer
 * @property {any} data
 */
export class Buffer {
  /**
   * Creates an instance of Buffer.
   * @constructor
   * @param {string} locationName - Attribute/uniform location name
   * @param {TypedArray|number} data - Data or length of data
   * @param {number} rows - Number of rows - default 1
   * @param {number} cols - Number of columns - default 1
   * @param {number} target - Buffer target - default ARRAY_BUFFER
   * @param {number} type - Buffer type - default DYNAMIC_DRAW
   * @param {number} divisor - Attribute divisor - default 1
   * @param {number} dataType - Data type - default FLOAT
   */
  constructor(locationName, data, rows, cols, target, type, divisor, dataType) {
    const elemCount = rows * cols;

    this.data =
      typeof data === "number" ? new Float32Array(data * elemCount) : data;
    this._locationName = locationName;
    this._rows = rows ?? 1;
    this._cols = cols ?? 1;
    this._target = target ?? Const.ARRAY_BUFFER;
    this._type = type ?? Const.DYNAMIC_DRAW;
    this._stride = elemCount * 4;
    this._offset = cols * 4;
    this._divisor = divisor ?? 1;
    this._dataType = dataType ?? Const.FLOAT;
    if (this._type === Const.STATIC_DRAW) this._stride = this._offset = 0;
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
   */
  upload(gl) {
    this.bind(gl);
    this._enable(gl);
    gl.bufferData(this._target, this.data, this._type);
  }

  /**
   * Destruct class
   */
  destruct(gl) {
    this.bind(gl);
    gl.deleteBuffer(this._buffer);
    this.data = this._buffer = null;
  }

  /**
   * @param {WebGLContext} gl
   * @ignore
   */
  _enable(gl) {
    const rows = this._rows,
      location = this._location,
      cols = this._cols,
      stride = this._stride,
      offset = this._offset,
      divisor = this._divisor,
      dataType = this._dataType;
    let i = -1;
    while (++i < rows) {
      const loc = location + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, cols, dataType, false, stride, i * offset);
      gl.vertexAttribDivisor(loc, divisor);
    }
  }
}
