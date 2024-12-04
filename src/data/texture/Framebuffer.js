import { TextureInfo } from "./TextureInfo";
import { Const } from "../../utils/Utils";
import "../../utils/Utils";

/**
 * Framebuffer
 * @extends {TextureInfo}
 */
export class Framebuffer extends TextureInfo {
  /**
   * Creates an instance of Framebuffer.
   * @constructor
   */
  constructor() {
    super();

    this._resizeUpdateId = 0;
    this._currentResizeUpdateId = -1;
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this.$width;
  }
  set width(v) {
    if (this.$width !== v && v > 0) {
      this.$width = v;
      ++this._resizeUpdateId;
    }
  }

  /**
   * Set/Get height
   * @type {number}
   */
  get height() {
    return this.$height;
  }
  set height(v) {
    if (this.$height !== v && v > 0) {
      this.$height = v;
      ++this._resizeUpdateId;
    }
  }

  /**
   * Set size
   * @param {number} w
   * @param {number} h
   */
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }

  /**
   * Bind to WebGlContext
   * @param {WebGLContext} gl
   */
  bind(gl) {
    gl.bindFramebuffer(Const.FRAMEBUFFER, this._framebuffer);
  }

  /**
   * Unbind from WebGLContext
   * @param {WebGLContext} gl
   */
  unbind(gl) {
    gl.bindFramebuffer(Const.FRAMEBUFFER, null);
  }

  /**
   * @param {WebGLContext} gl
   * @param {number} id
   * @returns {boolean}
   * @ignore
   */
  $hasNeedToDraw(gl, id) {
    if (this.$currentAglId < gl.agl_id) {
      this.$currentAglId = gl.agl_id;
      this._baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);

      this._framebuffer = gl.createFramebuffer();

      this.bind(gl);

      gl.framebufferTexture2D(
        Const.FRAMEBUFFER,
        Const.COLOR_ATTACHMENT0,
        Const.TEXTURE_2D,
        this._baseTexture,
        0
      );

      this.unbind(gl);

      return true;
    }

    if (this.$currentUpdateId < this.$updateId) {
      this.$currentUpdateId = this.$updateId;
      this.useActiveTextureAfterUpdate(gl, id);
      return true;
    }

    if (this._currentResizeUpdateId < this._resizeUpdateId) {
      this._currentResizeUpdateId = this._resizeUpdateId;
      this.useActiveTexture(gl, id);
      return true;
    }
  }
}
