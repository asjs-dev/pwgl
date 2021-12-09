import { Const } from "./Utils.js";

export class Buffer {
  constructor(locationName, data, rows, cols, target, type, divisor) {
    /*
    this._buffer
    */

    const length = rows * cols;

    this.data = typeof data === "number"
      ? new Float32Array(data * length)
      : data;
    this._locationName = locationName;
    this._rows = rows;
    this._cols = cols;
    this._target = target || Const.ARRAY_BUFFER;
    this._type = type || Const.DYNAMIC_DRAW;
    this._length = length * 4;
    this._offset = cols * 4;
    this._divisor = typeof divisor === "number"
      ? divisor
      : 1;

    if (this._type === Const.STATIC_DRAW)
      this._length =
      this._offset = 0;
  }

  create(gl) {
    this._buffer = gl.createBuffer();
    this.bind(gl);
  }

  bind(gl) {
    gl.bindBuffer(this._target, this._buffer);
  }

  upload(gl, enable, locations) {
    this.bind(gl);
    enable && this._enable(gl, locations);
		gl.bufferData(this._target, this.data, this._type);
  }

  enable(gl, locations) {
    this.bind(gl);
    this._enable(gl, locations);
  }

  destruct() {}

  _enable(gl, locations) {
    const location = locations[this._locationName];
    let i = -1;
    while (++i < this._rows) {
      const loc = location + i;
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
