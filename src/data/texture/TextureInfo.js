import "../../namespace.js";

AGL.TextureInfo = class {
  constructor() {
    /*
    this._baseTexture
    */

    this.target = AGL.Const.TEXTURE_2D;

    this._currenActivetId = -1;

    this._currentAglId =
    this._updateId =
    this._currentUpdateId = 0;

    this.wrapS =
    this.wrapT = AGL.Const.CLAMP_TO_EDGE;

    this.internalFormat =
    this.format = AGL.Const.RGBA;

    this.minFilter = AGL.Const.NEAREST_MIPMAP_NEAREST;
    this.magFilter = AGL.Const.NEAREST;

    this._width =
    this._height = 1;

    this.type = AGL.Const.UNSIGNED_BYTE;
  }

  get width() { return this._width; }

  get height() { return this._height; }

  useActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    this.useTexture(gl);
  }

  unbindTexture(gl, id) {
    this.activeTexture(gl, id);
    this._currenActivetId = -1;
    gl.bindTexture(this.target, null);
  }

  activeTexture(gl, id) {
    this._currenActivetId = id;
    gl.activeTexture(AGL.Const.TEXTURE0 + id);
  }

  bindActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    gl.bindTexture(this.target, this._baseTexture);
  }

  useTexture(gl) {
    gl.bindTexture(this.target, this._baseTexture);
    this.uploadTexture(gl);
  }

  uploadTexture(gl) {
    gl.texImage2D(
      this.target,
      0,
      this.internalFormat,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      this._renderSource
    );

    gl.texParameteri(this.target, AGL.Const.TEXTURE_MAX_LEVEL, 0);
    gl.generateMipmap(this.target);

    gl.texParameteri(this.target, AGL.Const.TEXTURE_WRAP_S, this.wrapS);
    gl.texParameteri(this.target, AGL.Const.TEXTURE_WRAP_T, this.wrapT);
    gl.texParameteri(this.target, AGL.Const.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(this.target, AGL.Const.TEXTURE_MAG_FILTER, this.magFilter);
  }

  destruct() {}
}
