import { emptyFunction } from "../utils/helpers.js";
import { Buffer } from "../utils/Buffer.js";
import { Utils, Const } from "../utils/Utils.js";
import { ColorProps } from "../data/props/ColorProps.js";

export class BaseRenderer {
  constructor(options) {
    /*
    this._program
    this._scale
    this._width
    this._height
    this._calcWidth
    this._calcHeight
    this.widthHalf
    this.heightHalf
    this._gl
    */

    this._attachFramebufferAlias = this._attachFramebuffer;

    this._clearBeforeRenderFunc =
    this._resizeFunc = emptyFunction;

    this.clearColor = new ColorProps();

    this._currentContextId =
    this._renderTime = 0;

    this.scale = options.scale || 1;

    this._options = options;
    this._config = this._options.config;
    this.context = this._config.context;
    this._config.locations = this._config.locations.concat([
      "uFlpY",
      "aPos",
      "uTex"
    ]);

    this._vao = this.context.gl.createVertexArray();

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

  get scale() { return this._scale; }
  set scale(v) {
    if (this._scale !== v) {
      this._scale = v;
      this._resizeFunc = this._customResize;
    }
  }

  get width() { return this._width; }
  set width(v) {
    if (this._width !== v) {
      this._width = v;
      this._resizeFunc = this._customResize;
    }
  }

  get height() { return this._height; }
  set height(v) {
    if (this._height !== v) {
      this._height = v;
      this._resizeFunc = this._customResize;
    }
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
      this._attachFramebufferAlias(framebuffer);
      this._renderBatch(framebuffer);
      framebuffer.unbind(this._gl);
    }
  }

  render() {
    if (!this.context.isLost()) {
      this._switchToProgram();
      this._gl.uniform1f(this._locations.uFlpY, 1);
      this._renderBatch();
    }
  }

  destruct() {}

  _renderBatch(framebuffer) {
    this._renderTime = Date.now();
    this._clearBeforeRenderFunc();
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
    framebuffer.setSize(this._calcWidth, this._calcHeight);
    this.context.useTexture(framebuffer, this._renderTime);
    this.context.deactivateTexture(framebuffer);
    framebuffer.bind(this._gl);
    this._clearBeforeRenderFunc();
    this._gl.uniform1f(this._locations.uFlpY, -1);
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
    this._resizeFunc();
    this.context.setSize(this._calcWidth, this._calcHeight);
  }

  _customResize() {
    this._resizeFunc = emptyFunction;
    this._calcWidth = this._width * this._scale;
    this._calcHeight = this._height * this._scale;
    this.widthHalf = this._calcWidth * .5;
    this.heightHalf = this._calcHeight * .5;
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

    const program = Utils.createProgram(
      this._gl,
      this._createVertexShader(options),
      this._createFragmentShader(options)
    );

    this._program = program;

    this._locations = Utils.getLocationsFor(
      this._gl,
      program,
      this._config.locations
    );

    this.context.useProgram(program, this._vao);

    this._createBuffers();
  }

  _uploadBuffers() {
    this._positionBuffer.upload(this._gl, true, this._locations);
    this._elementArrayBuffer.upload(this._gl);

    this._enableBuffers = false;
  }

  _createBuffers() {
    this._elementArrayBuffer.create(this._gl);
    this._positionBuffer.create(this._gl);
  }
}
