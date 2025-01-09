import { ColorProps } from "../data/props/ColorProps";
import { Framebuffer } from "../data/texture/Framebuffer";
import { noop } from "../utils/helpers";
import { Buffer } from "../utils/Buffer";
import { Utils, Const } from "../utils/Utils";

/**
 * @typedef {Object} BaseRendererConfig
 * @extends {RendererConfig}
 * @property {Object} config
 * @property {ColorProps} clearColor
 * @property {WebGL2Context} context
 * @property {boolean} resized
 * @property {number} width
 * @property {number} height
 * @property {number} widthHalf
 * @property {number} heightHalf
 */

/**
 * Base renderer
 */
export class BaseRenderer {
  /**
   * Creates an instance of BaseRenderer.
   * @constructor
   * @param {BaseRendererConfig} options
   */
  constructor(options) {
    this._clearBeforeRenderFunc = noop;

    this.$resizeFv = noop;

    this.width =
      this.height =
      this.widthHalf =
      this.heightHalf =
      this._currentContextId =
      this.$renderTime =
        0;

    this.clearColor = new ColorProps();

    this._options = options;
    const config = this._options.config;
    this.context = config.context;

    // prettier-ignore
    config.locations = [
      ...config.locations,
      "uFlpY",
      "aPos",
      "uTex"
    ];

    this._elementArrayBuffer = new Buffer(
      "",
      new Uint16Array([0, 1, 3, 2]),
      0,
      0,
      Const.ELEMENT_ARRAY_BUFFER,
      Const.STATIC_DRAW
    );

    // prettier-ignore
    this._positionBuffer = new Buffer(
      "aPos", new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1
      ]),
      1, 2,
      Const.ARRAY_BUFFER,
      Const.STATIC_DRAW,
      0
    );
  }

  /**
   * Set clear before render
   * @param {boolean} v
   */
  set clearBeforeRender(v) {
    this._clearBeforeRenderFunc = v ? this._clear : noop;
  }

  /**
   * Set size
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.$resizeFv = this.$resize;
  }

  /**
   * Render to framebuffer
   * @param {Framebuffer} framebuffer
   */
  renderToFramebuffer(framebuffer) {
    if (!this.context.isLost()) {
      this._switchToProgram();
      this.$attachFramebufferAndClear(framebuffer);
      this._renderBatch(framebuffer);
      framebuffer.unbind(this.$gl);
    }
  }

  /**
   * Render
   */
  render() {
    if (!this.context.isLost()) {
      this._switchToProgram();
      this.$gl.uniform1f(this.$locations.uFlpY, 1);
      this._clearBeforeRenderFunc();
      this._renderBatch();
    }
  }

  /**
   * Destruct class
   */
  destruct() {}

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  $attachFramebuffer(framebuffer) {
    framebuffer.bind(this.$gl);
    framebuffer.setSize(this.width, this.height);
    this.context.useTexture(framebuffer, this.$renderTime, false);
    this.context.deactivateTexture(framebuffer);
    this.$gl.uniform1f(this.$locations.uFlpY, -1);
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  $attachFramebufferAndClear(framebuffer) {
    this.$attachFramebuffer(framebuffer);
    this._clearBeforeRenderFunc();
  }

  /**
   * @ignore
   */
  $resize() {
    this.resized = true;
    this.$resizeFv = noop;
    this.widthHalf = this.width / 2;
    this.heightHalf = this.height / 2;
    this.context.setSize(this.width, this.height);
  }

  /**
   * @param {number} count
   * @ignore
   */
  $drawInstanced(count) {
    this.$gl.drawElementsInstanced(
      Const.TRIANGLE_STRIP,
      4,
      Const.UNSIGNED_SHORT,
      0,
      count
    );
  }

  /**
   * @param {TextureInfo} texture
   * @param {number} location
   * @param {number} index
   * @ignore
   */
  $useTextureAt(texture, location, index, forceBind) {
    this.$gl.uniform1i(
      location,
      this.context.useTextureAt(texture, index, this.$renderTime, forceBind)
    );
  }

  /**
   * @param {TextureInfo} texture
   * @param {number} location
   * @ignore
   */
  $useTexture(texture, location, forceBind) {
    this.$gl.uniform1i(
      location,
      this.context.useTexture(texture, this.$renderTime, forceBind)
    );
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    const gl = this.$gl;
    this._positionBuffer.upload(gl, this.$enableBuffers);
    this._elementArrayBuffer.upload(gl);
    this.$enableBuffers = false;
  }

  /**
   * @ignore
   */
  $createBuffers() {
    const gl = this.$gl,
      locations = this.$locations;
    this._elementArrayBuffer.create(gl, locations);
    this._positionBuffer.create(gl, locations);
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  _renderBatch(framebuffer) {
    this.$renderTime = Date.now();
    this.$render(framebuffer);
  }

  /**
   * @ignore
   */
  _switchToProgram() {
    this.$gl = this.context.gl;

    const context = this.context,
      contextId = context.contextId;

    if (this._currentContextId !== contextId) {
      this._currentContextId = contextId;
      this._buildProgram();
    } else this._useProgram();

    this.resized = false;
    this.$resizeFv();
  }

  /**
   * @ignore
   */
  _clear() {
    this.$gl.clearColor(
      this.clearColor.r,
      this.clearColor.g,
      this.clearColor.b,
      this.clearColor.a
    );
    this.$gl.clear(Const.COLOR_BUFFER_BIT);
  }

  /**
   * @ignore
   */
  _buildProgram() {
    this._program = Utils.createProgram(
      this.$gl,
      this.$createVertexShader(),
      this.$createFragmentShader()
    );

    this.$locations = Utils.getLocationsFor(
      this.$gl,
      this._program,
      this._options.config.locations
    );

    this._vao = this.$gl.createVertexArray();

    this._useProgram();

    this.$createBuffers();
  }

  /**
   * @ignore
   */
  _useProgram() {
    if (this.context.useProgram(this._program, this._vao))
      this.$enableBuffers = true;
  }
}
