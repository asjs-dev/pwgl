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
    this.target = WebGL2RenderingContext.TEXTURE_2D;
    this.wrapS = this.wrapT = WebGL2RenderingContext.CLAMP_TO_EDGE;
    this.internalFormat = this.format = WebGL2RenderingContext.RGBA;
    this.minFilter = this.magFilter = WebGL2RenderingContext.LINEAR;
    this.maxMipMapLevel = this.baseMipMapLevel = 0;
    this.type = WebGL2RenderingContext.UNSIGNED_BYTE;

    this.$currentAglId = this.$currentActiveId = -1;
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
    return this.$wrapS;
  }
  set wrapS(v) {
    this.$wrapS = v;
    this.$updated = true;
  }

  /**
   * Set/Get wrapT
   * @type {number}
   */
  get wrapT() {
    return this.$wrapT;
  }
  set wrapT(v) {
    this.$wrapT = v;
    this.$updated = true;
  }

  /**
   * Set/Get internal format
   * @type {number}
   */
  get internalFormat() {
    return this.$internalFormat;
  }
  set internalFormat(v) {
    this.$internalFormat = v;
    this.$updated = true;
  }

  /**
   * Set/Get format
   * @type {number}
   */
  get format() {
    return this.$format;
  }
  set format(v) {
    this.$format = v;
    this.$updated = true;
  }

  /**
   * Set/Get minFilter
   * @type {number}
   */
  get minFilter() {
    return this.$minFilter;
  }
  set minFilter(v) {
    this.$minFilter = v;
    this.$updated = true;
  }

  /**
   * Set/Get magFilter
   * @type {number}
   */
  get magFilter() {
    return this.$magFilter;
  }
  set magFilter(v) {
    this.$magFilter = v;
    this.$updated = true;
  }

  /**
   * Set/Get maxMipMapLevel
   * @type {number}
   */
  get maxMipMapLevel() {
    return this.$maxMipMapLevel;
  }
  set maxMipMapLevel(v) {
    this.$maxMipMapLevel = v;
    this.$updated = true;
  }

  /**
   * Set/Get baseMipMapLevel
   * @type {number}
   */
  get baseMipMapLevel() {
    return this.$baseMipMapLevel;
  }
  set baseMipMapLevel(v) {
    this.$baseMipMapLevel = v;
    this.$updated = true;
  }

  /**
   * Set/Get type
   * @type {number}
   */
  get type() {
    return this.$type;
  }
  set type(v) {
    this.$type = v;
    this.$updated = true;
  }

  /**
   * Use active TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   */
  useActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    this.useTexture(gl);
  }

  /**
   * Use active TextureInfo after update
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   */
  useActiveTextureAfterUpdate(gl, id) {
    this.activeTexture(gl, id);
    this.useTextureAfterUpdate(gl);
  }

  /**
   * Unbind TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   */
  unbindTexture(gl, id) {
    this.activeTexture(gl, id);
    this.$currentActiveId = -1;
    gl.bindTexture(this.target, null);
  }

  /**
   * Active TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   */
  activeTexture(gl, id) {
    this.$currentActiveId = id;
    gl.activeTexture(WebGL2RenderingContext.TEXTURE0 + id);
  }

  /**
   * Binf active TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   */
  bindActiveTexture(gl, id) {
    this.activeTexture(gl, id);
    gl.bindTexture(this.target, this.$baseTexture);
  }

  /**
   * Use TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   */
  useTexture(gl) {
    gl.bindTexture(this.target, this.$baseTexture);
    this.createTexImage2D(gl);
  }

  /**
   * Use TextureInfo after update
   * @param {WebGLContext} gl - The WebGL context
   */
  useTextureAfterUpdate(gl) {
    gl.bindTexture(this.target, this.$baseTexture);
    this.uploadTextureInfo(gl);
  }

  /**
   * Create TexImage2D
   * @param {WebGLContext} gl - The WebGL context
   */
  createTexImage2D(gl) {
    gl.texImage2D(
      this.target,
      0,
      this.$internalFormat,
      this.width,
      this.height,
      0,
      this.$format,
      this.$type,
      this.$renderSource,
    );

    this.uploadTextureInfo(gl);
  }

  /**
   * Upload TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   */
  uploadTextureInfo(gl) {
    const { target } = this;
    gl.texParameteri(target, WebGL2RenderingContext.TEXTURE_WRAP_S, this.$wrapS);
    gl.texParameteri(target, WebGL2RenderingContext.TEXTURE_WRAP_T, this.$wrapT);
    gl.texParameteri(target, WebGL2RenderingContext.TEXTURE_MIN_FILTER, this.$minFilter);
    gl.texParameteri(target, WebGL2RenderingContext.TEXTURE_MAG_FILTER, this.$magFilter);
    gl.texParameteri(target, WebGL2RenderingContext.TEXTURE_MAX_LEVEL, this.$maxMipMapLevel);
    gl.texParameteri(target, WebGL2RenderingContext.TEXTURE_BASE_LEVEL, this.$baseMipMapLevel);
    gl.generateMipmap(target);
  }
}
