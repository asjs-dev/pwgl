import { Const } from "../../utils/Utils";
import "../../utils/Utils";

/**
 * TextureInfo
 */
export class TextureInfo {
  /**
   * Creates an instance of TextureInfo.
   * @constructor
   */
  constructor() {
    /*
    this._baseTexture
    */

    this.target = Const.TEXTURE_2D;

    this._currenActiveId = -1;

    this._currentAglId = this._updateId = this._currentUpdateId = 0;

    this.wrapS = this.wrapT = Const.CLAMP_TO_EDGE;

    this.internalFormat = this.format = Const.RGBA;

    this.minFilter = Const.NEAREST_MIPMAP_LINEAR;
    this.magFilter = Const.NEAREST;

    this._width = this._height = 1;

    this.type = Const.UNSIGNED_BYTE;
  }

  /**
   * Get width
   * @readonly
   * @type {number}
   */
  get width() {
    return this._width;
  }

  /**
   * Get height
   * @readonly
   * @type {number}
   */
  get height() {
    return this._height;
  }

  /**
   * Set/Get wrapS
   * @type {number}
   */
  get wrapS() {
    return this._wrapS;
  }
  set wrapS(v) {
    if (this._wrapS !== v) {
      this._wrapS = v;
      ++this._updateId;
    }
  }

  /**
   * Set/Get wrapT
   * @type {number}
   */
  get wrapT() {
    return this._wrapT;
  }
  set wrapT(v) {
    if (this._wrapT !== v) {
      this._wrapT = v;
      ++this._updateId;
    }
  }

  /**
   * Set/Get internal format
   * @type {number}
   */
  get internalFormat() {
    return this._internalFormat;
  }
  set internalFormat(v) {
    if (this._internalFormat !== v) {
      this._internalFormat = v;
      ++this._updateId;
    }
  }

  /**
   * Set/Get format
   * @type {number}
   */
  get format() {
    return this._format;
  }
  set format(v) {
    if (this._format !== v) {
      this._format = v;
      ++this._updateId;
    }
  }

  /**
   * Set/Get minFilter
   * @type {number}
   */
  get minFilter() {
    return this._minFilter;
  }
  set minFilter(v) {
    if (this._minFilter !== v) {
      this._minFilter = v;
      ++this._updateId;
    }
  }

  /**
   * Set/Get magFilter
   * @type {number}
   */
  get magFilter() {
    return this._magFilter;
  }
  set magFilter(v) {
    if (this._magFilter !== v) {
      this._magFilter = v;
      ++this._updateId;
    }
  }

  /**
   * Set/Get type
   * @type {number}
   */
  get type() {
    return this._type;
  }
  set type(v) {
    if (this._type !== v) {
      this._type = v;
      ++this._updateId;
    }
  }

  /**
   * Use TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   * @param {boolean} forceBind
   * @param {number} renderTime
   */
  use(gl, id, forceBind, renderTime) {
    if (
      !this._hasNeedToDraw(gl, id, renderTime) &&
      (this._currenActiveId !== id || forceBind)
    )
      this.bindActiveTexture(gl, id);
  }

  /**
   * Use active TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   */
  useActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    this.useTexture(gl);
  }

  /**
   * Use active TextureInfo after update
   * @param {WebGLContext} gl
   * @param {number} id
   */
  useActiveTextureAfterUpdate(gl, id) {
    this.activeTexture(gl, id);
    this.useTextureAfterUpdate(gl);
  }

  /**
   * Unbind TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   */
  unbindTexture(gl, id) {
    this.activeTexture(gl, id);
    this._currenActiveId = -1;
    gl.bindTexture(this.target, null);
  }

  /**
   * Active TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   */
  activeTexture(gl, id) {
    this._currenActiveId = id;
    gl.activeTexture(Const.TEXTURE0 + id);
  }

  /**
   * Binf active TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   */
  bindActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    gl.bindTexture(this.target, this._baseTexture);
  }

  /**
   * Use TextureInfo
   * @param {WebGLContext} gl
   */
  useTexture(gl) {
    gl.bindTexture(this.target, this._baseTexture);
    this.createTexImage2D(gl);
  }

  /**
   * Use TextureInfo after update
   * @param {WebGLContext} gl
   */
  useTextureAfterUpdate(gl) {
    gl.bindTexture(this.target, this._baseTexture);
    this.uploadTextureInfo(gl);
  }

  /**
   * Create TexImage2D
   * @param {WebGLContext} gl
   */
  createTexImage2D(gl) {
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

  /**
   * Upload TextureInfo
   * @param {WebGLContext} gl
   */
  uploadTextureInfo(gl) {
    gl.texParameteri(this.target, Const.TEXTURE_WRAP_S, this._wrapS);
    gl.texParameteri(this.target, Const.TEXTURE_WRAP_T, this._wrapT);
    gl.texParameteri(this.target, Const.TEXTURE_MIN_FILTER, this._minFilter);
    gl.texParameteri(this.target, Const.TEXTURE_MAG_FILTER, this._magFilter);
    gl.texParameteri(this.target, Const.TEXTURE_MAX_LEVEL, 0);
    gl.generateMipmap(this.target);
  }

  /**
   * Destruct class
   */
  destruct() {}

  /**
   * @ignore
   */
  _hasNeedToDraw() {}
}
