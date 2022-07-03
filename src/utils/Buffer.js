import { Const } from "./Utils.js";

export class Buffer {
  constructor(locationName, data, rows, cols, target, type, divisor) {
    /*
    this._buffer
    this._location
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

  create(gl, locations) {
    this._location = locations[this._locationName];
    this._buffer = gl.createBuffer();
    this.bind(gl);
  }

  bind(gl) {
    gl.bindBuffer(this._target, this._buffer);
  }

  upload(gl, enable) {
    this.bind(gl);
    enable && this._enable(gl);
		gl.bufferData(this._target, this.data, this._type);
  }

  destruct() {
    this.data = null;
  }

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
