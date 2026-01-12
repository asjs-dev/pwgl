import { noop } from "../../extensions/utils/noop";
import { ColorProps } from "../data/props/ColorProps";
import { Framebuffer } from "../data/texture/Framebuffer";
import { Buffer } from "../utils/Buffer";
import { Utils, Const } from "../utils/Utils";

/**
 * @typedef {Object} BaseRendererConfig
 * @extends {RendererConfig}
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
   * @param {BaseRendererConfig} config
   */
  constructor(config) {
    this._clearBeforeRenderFunc = noop;

    this._resizeCalcFv = noop;

    this._rendererId = 1;

    this.width =
      this.height =
      this.widthHalf =
      this.heightHalf =
      this._currentContextId =
      this._currentRendererId =
      this.$renderTime =
        0;

    this.setSize(1, 1);

    this.clearColor = new ColorProps();

    this._config = config;
    this.context = config.context;

    // prettier-ignore
    Utils.setLocations(config, [
      "uFY",
      "aPs",
      "uTx"
    ]);

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
      "aPs", new Float32Array([
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
    this._resizeCalcFv = this.$resize;
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
      this.$gl.uniform1f(this.$locations.uFY, 1);
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
    this.$gl.uniform1f(this.$locations.uFY, -1);
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
    this._positionBuffer.upload(gl);
    this._elementArrayBuffer.upload(gl);
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
   * @ignore
   */
  $resize() {
    this.resized = true;
    this._resizeCalcFv = noop;
    this.widthHalf = this.width / 2;
    this.heightHalf = this.height / 2;
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

    if (
      this._currentContextId !== contextId ||
      this._currentRendererId !== this._rendererId
    ) {
      this._currentContextId = contextId;
      this._currentRendererId = this._rendererId;
      this._buildProgram();
    } else this._useProgram();

    this.resized = false;
    this._resizeCalcFv();
    this.context.setSize(this.width, this.height);
  }

  /**
   * @ignore
   */
  _clear() {
    const gl = this.$gl,
      color = this.clearColor;
    this.$gl.clearColor(color.r, color.g, color.b, color.a);
    this.$gl.clear(Const.COLOR_BUFFER_BIT);
  }

  /**
   * @ignore
   */
  _buildProgram() {
    const gl = this.$gl,
      shaderHeader = Utils.GLSL.VERSION + "precision highp float;\n";

    this._program = Utils.createProgram(
      gl,
      shaderHeader + this.$createVertexShader(),
      shaderHeader + this.$createFragmentShader()
    );
    
    this.$locations = Utils.getLocationsFor(
      gl,
      this._program,
      this._config.locations
    );

    this._vao = gl.createVertexArray();

    this._useProgram();

    this.$createBuffers();
  }

  /**
   * @ignore
   */
  _useProgram() {
    this.context.useProgram(this._program, this._vao);
  }
}
