import { TextureInfo } from "./TextureInfo";
import { Const } from "../../utils/Utils";

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

    this._resizeUpdateId = 1;
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this.$width;
  }
  set width(v) {
    if (this.$width !== v && v) {
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
    if (this.$height !== v && v) {
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
   * Use TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   * @param {boolean} forceBind
   */
  use(gl, id, forceBind) {
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

      return;
    }

    if (this.$updateId) {
      this.$updateId = 0;
      this.useActiveTextureAfterUpdate(gl, id);
      return;
    }

    if (this._resizeUpdateId) {
      this._resizeUpdateId = 0;
      this.useActiveTexture(gl, id);
      return;
    }

    if (this._currenActiveId !== id || forceBind)
      this.bindActiveTexture(gl, id);
  }

  /**
   * Destruct class
   */
  destruct() {}
}
