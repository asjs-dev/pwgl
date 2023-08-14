import { noop } from "../utils/helpers";
import { Buffer } from "../utils/Buffer";
import { Utils, Const } from "../utils/Utils";
import { ColorProps } from "../data/props/ColorProps";
import { Framebuffer } from "../data/texture/Framebuffer";

/**
 * @typedef {Object} BaseRendererConfig
 * @extends {RendererConfig}
 * @property {Object} config
 * @property {WebGlContext} config.context
 * @property {Array<string>} config.locations
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
    this.$attachFramebufferCustom = this.$attachFramebuffer;
    this.$attachFramebufferAndClearCustom = this.$attachFramebufferAndClear;

    this._clearBeforeRenderFunc = noop;

    this.clearColor = new ColorProps();

    this._currentContextId = this.$renderTime = 0;

    this._options = options;
    this._config = this._options.config;
    this.context = this._config.context;

    // prettier-ignore
    this._config.locations = this._config.locations.concat([
      "uFlpY",
      "aPos",
      "uTex"
    ]);

    this.$enableBuffers = false;

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
   * Set/Get clear before render
   * @type {boolean}
   */
  get clearBeforeRender() {
    return this._clearBeforeRenderFunc === this._clear;
  }
  /**
   * Set/Get clear before render
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
  }

  /**
   * Render to framebuffer
   * @param {Framebuffer} framebuffer
   */
  renderToFramebuffer(framebuffer) {
    if (!this.context.isLost()) {
      this._switchToProgram();
      this.$attachFramebufferAndClearCustom(framebuffer);
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
    this.context.useTexture(framebuffer, this.$renderTime);
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
  $useTextureAt(texture, location, index, forceBind = true) {
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
  $useTexture(texture, location, forceBind = true) {
    this.$gl.uniform1i(
      location,
      this.context.useTexture(texture, this.$renderTime, forceBind)
    );
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this._positionBuffer.upload(this.$gl, this.$enableBuffers);
    this._elementArrayBuffer.upload(this.$gl);

    this.$enableBuffers = false;
  }

  /**
   * @ignore
   */
  $createBuffers() {
    this._elementArrayBuffer.create(this.$gl, this.$locations);
    this._positionBuffer.create(this.$gl, this.$locations);
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  _renderBatch(framebuffer) {
    this.$renderTime = Date.now();
    this.$render(framebuffer);
    this.$gl.flush();
  }

  /**
   * @ignore
   */
  _switchToProgram() {
    this.$gl = this.context.gl;

    if (this._currentContextId < this.context.contextId) {
      this._currentContextId = this.context.contextId;
      this._buildProgram();
      this.$enableBuffers = true;
    } else if (this.context.useProgram(this._program, this._vao))
      this.$enableBuffers = true;

    this.$resize();
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
    const options = this._options;

    this._program = Utils.createProgram(
      this.$gl,
      this.$createVertexShader(options),
      this.$createFragmentShader(options)
    );

    this.$locations = Utils.getLocationsFor(
      this.$gl,
      this._program,
      this._config.locations
    );

    this._vao = this.$gl.createVertexArray();

    this.context.useProgram(this._program, this._vao);

    this.$createBuffers();
  }
}
