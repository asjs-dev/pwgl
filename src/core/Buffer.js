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
  constructor(
    locationName,
    data,
    rows = 1,
    cols = 1,
    target = WebGL2RenderingContext.ARRAY_BUFFER,
    type = WebGL2RenderingContext.DYNAMIC_DRAW,
    divisor = 1,
    dataType = WebGL2RenderingContext.FLOAT,
  ) {
    const elemCount = rows * cols;

    this.data = typeof data === "number" ? new Float32Array(data * elemCount) : data;
    this._locationName = locationName;
    this._rows = rows;
    this._cols = cols;
    this._target = target;
    this._type = type;
    this._stride = elemCount * 4;
    this._offset = cols * 4;
    this._divisor = divisor;
    this._dataType = dataType;
    if (this._type === WebGL2RenderingContext.STATIC_DRAW) {
      this._stride = this._offset = 0;
    }
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
   * Upload a limited number of buffer elements.
   * @param {WebGLContext} gl
   * @param {number} elementCount - Number of structured elements to upload
   */
  uploadElements(gl, elementCount) {
    this.bind(gl);
    this._enable(gl);
    gl.bufferData(this._target, this.data, this._type, 0, elementCount * this._rows * this._cols);
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
    const { _rows, _location, _cols, _stride, _offset, _divisor, _dataType } = this;
    let i = -1;
    while (++i < _rows) {
      const loc = _location + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, _cols, _dataType, false, _stride, i * _offset);
      gl.vertexAttribDivisor(loc, _divisor);
    }
  }
}
