import { Const } from "../../utils/Utils";

/**
 * TextureInfo
 * @property {number} target
 */
export class TextureInfo {
  /**
   * Creates an instance of TextureInfo.
   * @constructor
   */
  constructor() {
    this.target = Const.TEXTURE_2D;
    this.wrapS = this.wrapT = Const.CLAMP_TO_EDGE;
    this.internalFormat = this.format = Const.RGBA;
    this.minFilter = this.magFilter = Const.LINEAR;
    this.maxMipMapLevel = this.baseMipMapLevel = 0;
    this.type = Const.UNSIGNED_BYTE;

    this.$currentAglId = this._currenActiveId = -1;
    this.$updated = true;
    this.$width = this.$height = 1;
  }

  /**
   * Get width
   * @readonly
   * @type {number}
   */
  get width() {
    return this.$width;
  }

  /**
   * Get height
   * @readonly
   * @type {number}
   */
  get height() {
    return this.$height;
  }

  /**
   * Set/Get wrapS
   * @type {number}
   */
  get wrapS() {
    return this._wrapS;
  }
  set wrapS(v) {
    this._wrapS = v;
    this.$updated = true;
  }

  /**
   * Set/Get wrapT
   * @type {number}
   */
  get wrapT() {
    return this._wrapT;
  }
  set wrapT(v) {
    this._wrapT = v;
    this.$updated = true;
  }

  /**
   * Set/Get internal format
   * @type {number}
   */
  get internalFormat() {
    return this._internalFormat;
  }
  set internalFormat(v) {
    this._internalFormat = v;
    this.$updated = true;
  }

  /**
   * Set/Get format
   * @type {number}
   */
  get format() {
    return this._format;
  }
  set format(v) {
    this._format = v;
    this.$updated = true;
  }

  /**
   * Set/Get minFilter
   * @type {number}
   */
  get minFilter() {
    return this._minFilter;
  }
  set minFilter(v) {
    this._minFilter = v;
    this.$updated = true;
  }

  /**
   * Set/Get magFilter
   * @type {number}
   */
  get magFilter() {
    return this._magFilter;
  }
  set magFilter(v) {
    this._magFilter = v;
    this.$updated = true;
  }

  /**
   * Set/Get maxMipMapLevel
   * @type {number}
   */
  get maxMipMapLevel() {
    return this._maxMipMapLevel;
  }
  set maxMipMapLevel(v) {
    this._maxMipMapLevel = v;
    this.$updated = true;
  }

  /**
   * Set/Get baseMipMapLevel
   * @type {number}
   */
  get baseMipMapLevel() {
    return this._baseMipMapLevel;
  }
  set baseMipMapLevel(v) {
    this._baseMipMapLevel = v;
    this.$updated = true;
  }

  /**
   * Set/Get type
   * @type {number}
   */
  get type() {
    return this._type;
  }
  set type(v) {
    this._type = v;
    this.$updated = true;
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
      this.$renderSource
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
    gl.texParameteri(
      this.target,
      Const.TEXTURE_MAX_LEVEL,
      this._maxMipMapLevel
    );
    gl.texParameteri(
      this.target,
      Const.TEXTURE_BASE_LEVEL,
      this._baseMipMapLevel
    );
    gl.generateMipmap(this.target);
  }
}
