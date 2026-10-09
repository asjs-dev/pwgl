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
    this.$locationName = locationName;
    this.$rows = rows;
    this.$cols = cols;
    this.$target = target;
    this.$type = type;
    this.$stride = elemCount * 4;
    this.$offset = cols * 4;
    this.$divisor = divisor;
    this.$dataType = dataType;
    this.$byteCapacity = 0;
    if (this.$type === WebGL2RenderingContext.STATIC_DRAW) {
      this.$stride = this.$offset = 0;
    }
    // Chrome 151 ANGLE OpenGL ES may drop the final instance at the exact buffer boundary.
    // Revisit and remove this padding after the upstream browser regression is fixed.
    this.$bytePadding = this.$divisor ? this.$stride : 0;
  }

  /**
   * Create and binf buffer
   * @param {WebGLContext} gl
   * @param {Object} locations
   */
  create(gl, locations) {
    this.$location = locations[this.$locationName];
    this.$buffer = gl.createBuffer();
    this.bind(gl);
    this.$byteCapacity = this.data.byteLength + this.$bytePadding;
    gl.bufferData(this.$target, this.$byteCapacity, this.$type);
    this.$enable(gl);
  }

  /**
   * binf buffer
   * @param {WebGLContext} gl
   */
  bind(gl) {
    gl.bindBuffer(this.$target, this.$buffer);
  }

  /**
   * Upload buffer
   * @param {WebGLContext} gl
   */
  upload(gl) {
    this.bind(gl);
    this.$uploadData(gl, this.data.length);
  }

  /**
   * Upload a limited number of buffer elements.
   * @param {WebGLContext} gl
   * @param {number} elementCount - Number of structured elements to upload
   */
  uploadElements(gl, elementCount) {
    this.bind(gl);
    this.$uploadData(gl, elementCount * this.$rows * this.$cols);
  }

  /**
   * Destruct class
   */
  destruct(gl) {
    this.bind(gl);
    gl.deleteBuffer(this.$buffer);
    this.data = this.$buffer = null;
    this.$byteCapacity = 0;
  }

  /**
   * @param {WebGLContext} gl
   * @param {number} elementCount
   * @ignore
   */
  $uploadData(gl, elementCount) {
    const { data } = this;
    const requiredByteCapacity = data.byteLength + this.$bytePadding;
    if (requiredByteCapacity > this.$byteCapacity) {
      this.$byteCapacity = requiredByteCapacity;
      gl.bufferData(this.$target, this.$byteCapacity, this.$type);
    }
    gl.bufferSubData(this.$target, 0, data, 0, elementCount);
  }

  /**
   * @param {WebGLContext} gl
   * @ignore
   */
  $enable(gl) {
    const { $rows, $location, $cols, $stride, $offset, $divisor, $dataType } = this;
    let i = -1;
    while (++i < $rows) {
      const loc = $location + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, $cols, $dataType, false, $stride, i * $offset);
      gl.vertexAttribDivisor(loc, $divisor);
    }
  }
}
