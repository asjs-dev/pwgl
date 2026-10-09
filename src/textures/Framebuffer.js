import { TextureInfo } from "./TextureInfo";

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

    this.$resized = true;
  }

  /**
   * Set/Get width
   * @type {number}
   */
  get width() {
    return this.$width;
  }
  set width(v) {
    if (this.$width !== v) {
      this.$width = v;
      this.$resized = true;
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
    if (this.$height !== v) {
      this.$height = v;
      this.$resized = true;
    }
  }

  /**
   * Set size
   * @param {number} w - Width
   * @param {number} h - Height
   */
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }

  /**
   * Bind to WebGlContext
   * @param {WebGLContext} gl - The WebGL context
   */
  bind(gl) {
    gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, this.$framebuffer);
  }

  /**
   * Unbind from WebGLContext
   * @param {WebGLContext} gl - The WebGL context
   */
  unbind(gl) {
    gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
  }

  /**
   * Use TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   * @param {boolean} forceBind - Force bind
   */
  use(gl, id, forceBind) {
    if (this.$currentAglId < gl.gl_id) {
      this.$currentAglId = gl.gl_id;
      this.$baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);

      this.$framebuffer = gl.createFramebuffer();

      this.bind(gl);

      gl.framebufferTexture2D(
        WebGL2RenderingContext.FRAMEBUFFER,
        WebGL2RenderingContext.COLOR_ATTACHMENT0,
        WebGL2RenderingContext.TEXTURE_2D,
        this.$baseTexture,
        0,
      );

      this.unbind(gl);
      this.$updated = this.$resized = false;
    } else if (this.$resized) {
      this.$updated = this.$resized = false;
      this.useActiveTexture(gl, id);
    } else if (this.$updated) {
      this.$updated = false;
      this.useActiveTextureAfterUpdate(gl, id);
    } else if (this.$currentActiveId !== id || forceBind) {
      this.bindActiveTexture(gl, id);
    }
  }

  /**
   * Destruct class
   */
  destruct() {}
}
