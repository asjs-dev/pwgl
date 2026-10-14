import { noop } from "../../common/utils/noop";
import { Color } from "../attributes/Color";
import { Buffer } from "../core/Buffer";
import { Utils } from "../core/Utils";
import { Framebuffer } from "../textures/Framebuffer";
import { nextVersion } from "../utils/nextVersion";

/**
 * @typedef {Object} BaseRendererConfig
 * @extends {RendererConfig}
 * @property {Color} clearColor
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
    this.$clearBeforeRenderFv = noop;

    this.$resizeCalcFv = noop;

    this.$rendererId = 1;

    this.width =
      this.height =
      this.widthHalf =
      this.heightHalf =
      this.$currentContextId =
      this.$currentRendererId =
      this.$renderTime =
        0;

    this.setSize(1, 1);

    this.clearColor = new Color();

    this.$config = config;
    this.context = config.context;

    // prettier-ignore
    Utils.setLocations(config, [
      "aA",
      "uA",
      "uB"
    ]);

    // prettier-ignore
    this.$elementArrayBuffer = new Buffer(
      "",
      new Uint16Array([0, 1, 3, 2]),
      0,
      0,
      WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
      WebGL2RenderingContext.STATIC_DRAW
    );

    // prettier-ignore
    this.$positionBuffer = new Buffer(
      "aA",
      new Uint16Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1
      ]),
      1,
      2,
      WebGL2RenderingContext.ARRAY_BUFFER,
      WebGL2RenderingContext.STATIC_DRAW,
      0,
      WebGL2RenderingContext.UNSIGNED_SHORT
    );
  }

  /**
   * Set clear before render
   * @param {boolean} v
   */
  set clearBeforeRender(v) {
    this.$clearBeforeRenderFv = v ? this.$clear : noop;
  }

  /**
   * Set size
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.$resizeCalcFv = this.$resize;
  }

  /**
   * Render to framebuffer
   * @param {Framebuffer} framebuffer
   */
  renderToFramebuffer(framebuffer) {
    if (!this.context.isLost()) {
      this.$switchToProgram();
      this.$attachFramebufferAndClear(framebuffer);
      this.$renderBatch(framebuffer);
      framebuffer.unbind(this.$gl);
    }
  }

  /**
   * Render
   */
  render() {
    if (!this.context.isLost()) {
      this.$switchToProgram();
      this.$gl.uniform1f(this.$locations.uA, 1);
      this.$clearBeforeRenderFv();
      this.$renderBatch();
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
    framebuffer.setSize(this.width, this.height);
    this.context.useTexture(framebuffer, this.$renderTime, false);
    this.context.deactivateTexture(framebuffer);
    framebuffer.bind(this.$gl);
    this.$gl.uniform1f(this.$locations.uA, -1);
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  $attachFramebufferAndClear(framebuffer) {
    this.$attachFramebuffer(framebuffer);
    this.$clearBeforeRenderFv();
  }

  /**
   * @param {number} count
   * @ignore
   */
  $drawInstanced(count) {
    this.$gl.drawElementsInstanced(
      WebGL2RenderingContext.TRIANGLE_STRIP,
      4,
      WebGL2RenderingContext.UNSIGNED_SHORT,
      0,
      count,
    );
  }

  /**
   * @param {TextureInfo} texture
   * @param {number} location
   * @param {number} index
   * @ignore
   */
  $useTextureAt(texture, location, index, forceBind) {
    this.$gl.uniform1i(location, this.context.useTextureAt(texture, index, this.$renderTime, forceBind));
  }

  /**
   * @param {TextureInfo} texture
   * @param {number} location
   * @ignore
   */
  $useTexture(texture, location, forceBind) {
    this.$gl.uniform1i(location, this.context.useTexture(texture, this.$renderTime, forceBind));
  }

  /**
   * @ignore
   */
  $uploadBuffers() {}

  /**
   * @ignore
   */
  $createBuffers() {
    const { $gl, $locations } = this;
    this.$elementArrayBuffer.create($gl, $locations);
    this.$positionBuffer.create($gl, $locations);
    this.$positionBuffer.upload($gl);
    this.$elementArrayBuffer.upload($gl);
  }

  /**
   * @ignore
   */
  $resize() {
    this.resized = true;
    this.$resizeVersion = nextVersion();
    this.$resizeCalcFv = noop;
    this.widthHalf = this.width / 2;
    this.heightHalf = this.height / 2;
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  $renderBatch(framebuffer) {
    this.$renderTime = Date.now();
    this.$render(framebuffer);
  }

  /**
   * @ignore
   */
  $switchToProgram() {
    this.$gl = this.context.gl;

    const { context } = this;
    const { contextId } = context;

    if (this.$currentContextId !== contextId || this.$currentRendererId !== this.$rendererId) {
      this.$currentContextId = contextId;
      this.$currentRendererId = this.$rendererId;
      this.$buildProgram();
    } else this.$useProgram();

    this.resized = false;
    this.$resizeCalcFv();
    this.context.setSize(this.width, this.height);
  }

  /**
   * @ignore
   */
  $clear() {
    const { $gl, clearColor } = this;
    $gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
    $gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
  }

  /**
   * @ignore
   */
  $buildProgram() {
    const { $gl } = this;
    const shaderHeader = Utils.GLSL.VERSION + "precision highp float;\n";

    this.$program = Utils.createProgram(
      $gl,
      shaderHeader + this.$createVertexShader(),
      shaderHeader + this.$createFragmentShader(),
    );

    this.$locations = Utils.getLocationsFor($gl, this.$program, this.$config.locations);

    this.$vao = $gl.createVertexArray();

    this.$useProgram();

    this.$createBuffers();
  }

  /**
   * @ignore
   */
  $useProgram() {
    this.context.useProgram(this.$program, this.$vao);
  }
}
