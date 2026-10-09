import { noop } from "../../common/utils/noop";
import { noopReturnsWith } from "../../common/utils/noopReturnsWith";
import { removeFromArray } from "../../common/utils/removeFromArray";
import "../rendering/BlendMode";
import { TextureInfo } from "../textures/TextureInfo";
import { Utils } from "./Utils";

/**
 * Context
 * @property {HTMLCanvasElement} canvas
 * @property {number} contextId
 * @property {Array<number>} textureIds
 * @property {Array<{width: number, height: number}>} textureSizes
 * @property {WebGL2Context} gl
 * @property {function} isLost Returns context lost state
 */
export class Context {
  /**
   * Creates an instance of Context.
   * @constructor
   * @param {ContextConfig} config
   */
  constructor(config = {}) {
    this.contextId = 0;

    this.isLost = noopReturnsWith(1);

    this.$config = Utils.initContextConfig(config);

    this.$onContextLost = this.$onContextLost.bind(this);
    this.$initContext = this.$initContext.bind(this);

    const { canvas } = this.$config;
    this.canvas = canvas;
    canvas.addEventListener("webglcontextlost", this.$onContextLost);
    canvas.addEventListener("webglcontextrestored", this.$initContext);

    this.$initContext();
  }

  /**
   * Use BlendModeInfo
   * @param {BlendModeInfo} blendMode
   */
  useBlendMode(blendMode) {
    this.$currentBlendMode = blendMode;

    const { gl } = this;
    gl[blendMode.equationName].apply(gl, blendMode.equations);
    gl[blendMode.functionName].apply(gl, blendMode.functions);
  }

  /**
   * Set BlendModeInfo
   * @param {BlendModeInfo} blendMode
   * @param {function} drawCallback
   */
  setBlendMode(blendMode, drawCallback) {
    if (this.$currentBlendMode !== blendMode) {
      drawCallback && drawCallback();
      this.useBlendMode(blendMode);
    }
  }

  /**
   * Destruct class
   */
  destruct() {
    this.gl.useProgram(null);

    const { canvas } = this;
    canvas.removeEventListener("webglcontextlost", this.$onContextLost);
    canvas.removeEventListener("webglcontextrestored", this.$initContext);

    this.$loseContext();
  }

  /**
   * Clear textures
   */
  clearTextures() {
    const { maxTextureImageUnits } = Utils.INFO;
    let i = -1;

    while (++i < maxTextureImageUnits) {
      this.$textureMap[i] = null;
      this.$emptyTextureSlots[i] = i;
      this.$setTextureSizeAt(i, 0, 0);
    }

    this.textureIds.length = this.textureSizes.length = 0;
  }

  /**
   * Use TextureInfo
   * @param {TextureInfo} textureInfo
   * @param {number} renderTime
   * @param {boolean} forceBind
   * @param {function} callback
   * @returns {number}
   */
  useTexture(textureInfo, renderTime, forceBind = true, callback = noop) {
    if (!textureInfo) {
      return -1;
    }

    let textureId = this.$textureMap.indexOf(textureInfo);
    if (textureId < 0) {
      if (!this.$emptyTextureSlots.length) {
        callback();
        this.clearTextures();
        textureId = 0;
      } else textureId = this.$emptyTextureSlots[0];
      forceBind = true;
    }

    return this.useTextureAt(textureInfo, textureId, renderTime, forceBind);
  }

  /**
   * Use TextureInfo at
   * @param {TextureInfo} textureInfo
   * @param {number} textureId
   * @param {number} renderTime
   * @param {boolean} forceBind
   * @returns {number}
   */
  useTextureAt(textureInfo, textureId, renderTime, forceBind = true) {
    textureInfo.use(this.gl, textureId, forceBind, renderTime);

    this.$textureMap[textureId] = textureInfo;

    this.$setTextureSizeAt(textureId, textureInfo.width, textureInfo.height);

    !this.textureIds.includes(textureId) && this.textureIds.push(textureId);

    removeFromArray(this.$emptyTextureSlots, textureId);

    return textureId;
  }

  /**
   * Deactivate TextureInfo
   * @param {TextureInfo} textureInfo
   */
  deactivateTexture(textureInfo) {
    const textureId = this.$textureMap.indexOf(textureInfo);
    textureId > -1 && textureInfo.unbindTexture(this.gl, textureId);
  }

  /**
   * Use WebGLProgram
   * @param {WebGLProgram} program
   * @param {Float32Array} vao
   * @returns {boolean}
   */
  useProgram(program, vao) {
    const { gl } = this;

    if (this.$currentProgram !== program) {
      this.$currentProgram = program;
      this.clearTextures();
      gl.useProgram(program);
    }

    if (this.$currentVertexArray !== vao) {
      this.$currentVertexArray = vao;
      gl.bindVertexArray(vao);
    }
  }

  /**
   * Set canvas size
   * @param {number} width canvas width
   * @param {number} height canvas height
   */
  setCanvasSize(width, height) {
    const { canvas } = this;
    canvas.width = width;
    canvas.height = height;
  }

  /**
   * Set context size
   * @param {number} width context width
   * @param {number} height context height
   */
  setSize(width, height) {
    if (this.$width !== width || this.$height !== height) {
      this.$width = width;
      this.$height = height;

      const { gl } = this;
      gl.viewport(0, 0, width, height);
      gl.scissor(0, 0, width, height);
    }
  }

  /**
   * @ignore
   */
  $setTextureSizeAt(textureId, width, height) {
    this.textureSizes[textureId * 2] = width;
    this.textureSizes[textureId * 2 + 1] = height;
  }

  /**
   * @param {Object} event
   * @ignore
   */
  $onContextLost(event) {
    event.preventDefault();
    setTimeout(this.$restoreContext, 1);
  }

  /**
   * @ignore
   */
  $initContext() {
    const gl = (this.gl = this.canvas.getContext("webgl2", this.$config.contextAttributes));

    gl.gl_id = ++this.contextId;

    const loseContextExt = gl.getExtension("WEBGL_lose_context");
    if (loseContextExt) {
      this.$restoreContext = loseContextExt.restoreContext.bind(loseContextExt);
      this.$loseContext = loseContextExt.loseContext.bind(loseContextExt);
    } else this.$restoreContext = this.$loseContext = noop;

    this.isLost = gl.isContextLost ? gl.isContextLost.bind(gl) : noopReturnsWith(1);

    gl.pixelStorei(WebGL2RenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(WebGL2RenderingContext.BLEND);
    gl.blendColor(1, 1, 1, 1);
    gl.enable(WebGL2RenderingContext.SCISSOR_TEST);

    this.$width =
      this.$height =
      this.$currentProgram =
      this.$currentVertexArray =
      this.$currentBlendMode =
        null;

    this.$textureMap = [];
    this.$emptyTextureSlots = [];
    this.textureIds = [];
    this.textureSizes = [];

    this.clearTextures();
    this.setCanvasSize(1, 1);

    const { initCallback } = this.$config;
    initCallback && setTimeout(initCallback, 1);
  }
}
