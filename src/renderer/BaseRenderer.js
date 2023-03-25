import { emptyFunction } from "../utils/helpers.js";
import { Buffer } from "../utils/Buffer.js";
import { Utils, Const } from "../utils/Utils.js";
import { ColorProps } from "../data/props/ColorProps.js";

export class BaseRenderer {
  constructor(options) {
    /*
    this._program
    this.widthHalf
    this.heightHalf
    this._gl
    this._vao;
    */

    this._attachFramebufferCustom = this._attachFramebuffer;
    this._attachFramebufferAndClearCustom = this._attachFramebufferAndClear;

    this._clearBeforeRenderFunc = emptyFunction;

    this.clearColor = new ColorProps();

    this._currentContextId =
    this._renderTime = 0;

    this._options = options;
    this._config = this._options.config;
    this.context = this._config.context;
    this._config.locations = this._config.locations.concat([
      "uFlpY",
      "aPos",
      "uTex"
    ]);

    this._enableBuffers = false;

    this._elementArrayBuffer = new Buffer(
      "", new Uint16Array([
        0, 1, 3, 2
      ]),
      0, 0,
      Const.ELEMENT_ARRAY_BUFFER,
      Const.STATIC_DRAW
    );

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

  get clearBeforeRender() { return this._clearBeforeRenderFunc === this._clear; }
  set clearBeforeRender(v) {
    this._clearBeforeRenderFunc = v
      ? this._clear
      : emptyFunction;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  renderToFramebuffer(framebuffer) {
    if (!this.context.isLost()) {
      this._switchToProgram();
      this._attachFramebufferAndClearCustom(framebuffer);
      this._renderBatch(framebuffer);
      framebuffer.unbind(this._gl);
    }
  }

  render() {
    if (!this.context.isLost()) {
      this._switchToProgram();
      this._gl.uniform1f(this._locations.uFlpY, 1);
      this._clearBeforeRenderFunc();
      this._renderBatch();
    }
  }

  _renderBatch(framebuffer) {
    this._renderTime = Date.now();
    this._render(framebuffer);
    this._gl.flush();
  }

  _switchToProgram() {
    this._gl = this.context.gl;

    if (this._currentContextId < this.context.contextId) {
      this._currentContextId = this.context.contextId;
      this._buildProgram();
      this._enableBuffers = true;
    } else if (this.context.useProgram(this._program, this._vao))
      this._enableBuffers = true;

    this._resize();
  }

  _attachFramebuffer(framebuffer) {
    framebuffer.bind(this._gl);
    framebuffer.setSize(this.width, this.height);
    this.context.useTexture(framebuffer, this._renderTime);
    this.context.deactivateTexture(framebuffer);
    this._gl.uniform1f(this._locations.uFlpY, -1);
  }

  _attachFramebufferAndClear(framebuffer) {
    this._attachFramebuffer(framebuffer);
    this._clearBeforeRenderFunc();
  }

  _clear() {
    this._gl.clearColor(
      this.clearColor.r,
      this.clearColor.g,
      this.clearColor.b,
      this.clearColor.a
    );
    this._gl.clear(Const.COLOR_BUFFER_BIT);
  }

  _resize() {
    this.widthHalf = this.width * .5;
    this.heightHalf = this.height * .5;
    this.context.setSize(this.width, this.height);
  }

  _drawInstanced(count) {
    this._gl.drawElementsInstanced(
      Const.TRIANGLE_STRIP,
      4,
      Const.UNSIGNED_SHORT,
      0,
      count
    );
  }

  _buildProgram() {
    const options = this._options;

    this._program = Utils.createProgram(
      this._gl,
      this._createVertexShader(options),
      this._createFragmentShader(options)
    );

    this._locations = Utils.getLocationsFor(
      this._gl,
      this._program,
      this._config.locations
    );

    this._vao = this._gl.createVertexArray();

    this.context.useProgram(this._program, this._vao);

    this._createBuffers();
  }

  _uploadBuffers() {
    this._positionBuffer.upload(this._gl, this._enableBuffers);
    this._elementArrayBuffer.upload(this._gl);

    this._enableBuffers = false;
  }

  _createBuffers() {
    this._elementArrayBuffer.create(this._gl, this._locations);
    this._positionBuffer.create(this._gl, this._locations);
  }
}
