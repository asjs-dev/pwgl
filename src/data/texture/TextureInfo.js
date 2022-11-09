import { Const } from "../../utils/Utils.js";

export class TextureInfo {
  constructor() {
    /*
    this._baseTexture
    */

    this.target = Const.TEXTURE_2D;

    this._currenActiveId = -1;

    this._currentAglId =
    this._updateId =
    this._currentUpdateId = 0;

    this.wrapS =
    this.wrapT = Const.CLAMP_TO_EDGE;

    this.internalFormat =
    this.format = Const.RGBA;

    this.minFilter = Const.NEAREST_MIPMAP_NEAREST;
    this.magFilter = Const.NEAREST;

    this._width =
    this._height = 1;

    this.type = Const.UNSIGNED_BYTE;
  }

  get width() { return this._width; }

  get height() { return this._height; }

  get wrapS() { return this._wrapS; }
  set wrapS(v) {
    if (this._wrapS !== v) {
      this._wrapS = v;
      ++this._updateId;
    }
  }

  get wrapT() { return this._wrapT; }
  set wrapT(v) {
    if (this._wrapT !== v) {
      this._wrapT = v;
      ++this._updateId;
    }
  }

  get internalFormat() { return this._internalFormat; }
  set internalFormat(v) {
    if (this._internalFormat !== v) {
      this._internalFormat = v;
      ++this._updateId;
    }
  }

  get format() { return this._format; }
  set format(v) {
    if (this._format !== v) {
      this._format = v;
      ++this._updateId;
    }
  }

  get minFilter() { return this._minFilter; }
  set minFilter(v) {
    if (this._minFilter !== v) {
      this._minFilter = v;
      ++this._updateId;
    }
  }

  get magFilter() { return this._magFilter; }
  set magFilter(v) {
    if (this._magFilter !== v) {
      this._magFilter = v;
      ++this._updateId;
    }
  }

  get type() { return this._type; }
  set type(v) {
    if (this._type !== v) {
      this._type = v;
      ++this._updateId;
    }
  }

  use(gl, id, forceBind, renderTime) {
    if (
      !this._isNeedToDraw(gl, id, renderTime) &&
      (this._currenActiveId !== id || forceBind)
    ) this.bindActiveTexture(gl, id);
  }

  useActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    this.useTexture(gl);
  }

  useActiveTextureAfterUpdate(gl, id) {
    this.activeTexture(gl, id);
    this.useTextureAfterUpdate(gl);
  }

  unbindTexture(gl, id) {
    this.activeTexture(gl, id);
    this._currenActiveId = -1;
    gl.bindTexture(this.target, null);
  }

  activeTexture(gl, id) {
    this._currenActiveId = id;
    gl.activeTexture(Const.TEXTURE0 + id);
  }

  bindActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    gl.bindTexture(this.target, this._baseTexture);
  }

  useTexture(gl) {
    gl.bindTexture(this.target, this._baseTexture);
    this.uploadTexture(gl);
  }

  useTextureAfterUpdate(gl) {
    gl.bindTexture(this.target, this._baseTexture);
    this.uploadTextureInfo(gl);
  }

  uploadTexture(gl) {
    gl.texImage2D(
      this.target,
      0,
      this._internalFormat,
      this.width,
      this.height,
      0,
      this._format,
      this._type,
      this._renderSource
    );

    this.uploadTextureInfo(gl);
  }

  uploadTextureInfo(gl) {
    gl.texParameteri(this.target, Const.TEXTURE_MAX_LEVEL, 0);
    gl.generateMipmap(this.target);

    gl.texParameteri(this.target, Const.TEXTURE_WRAP_S, this._wrapS);
    gl.texParameteri(this.target, Const.TEXTURE_WRAP_T, this._wrapT);
    gl.texParameteri(this.target, Const.TEXTURE_MIN_FILTER, this._minFilter);
    gl.texParameteri(this.target, Const.TEXTURE_MAG_FILTER, this._magFilter);
  }

  destruct() {}

  _isNeedToDraw() {}
}
