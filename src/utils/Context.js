import { noopReturnsOne, removeFromArray } from "./helpers";
import { Utils, Const } from "./Utils";
import { TextureInfo } from "../data/texture/TextureInfo";
import "../data/BlendMode";

/**
 * Context
 * @property {HTMLCanvasElement} canvas
 * @property {number} contextId
 * @property {Array<number>} textureIds
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

    this.isLost = noopReturnsOne;

    this._config = Utils.initContextConfig(config);

    this._onContextLost = this._onContextLost.bind(this);
    this._initContext = this._initContext.bind(this);

    const canvas = this._config.canvas;
    this.canvas = canvas;
    canvas.addEventListener("webglcontextlost", this._onContextLost);
    canvas.addEventListener("webglcontextrestored", this._initContext);

    this._initContext();
  }

  /**
   * Use BlendModeInfo
   * @param {BlendModeInfo} blendMode
   */
  useBlendMode(blendMode) {
    this._currentBlendMode = blendMode;

    const gl = this.gl;
    gl[blendMode.equationName].apply(gl, blendMode.equations);
    gl[blendMode.functionName].apply(gl, blendMode.functions);
  }

  /**
   * Set BlendModeInfo
   * @param {BlendModeInfo} blendMode
   * @param {function} drawCallback
   */
  setBlendMode(blendMode, drawCallback) {
    if (this._currentBlendMode !== blendMode) {
      drawCallback && drawCallback();
      this.useBlendMode(blendMode);
    }
  }

  /**
   * Destruct class
   */
  destruct() {
    this.gl.useProgram(null);

    const canvas = this.canvas;
    canvas.removeEventListener("webglcontextlost", this._onContextLost);
    canvas.removeEventListener("webglcontextrestored", this._initContext);

    this._loseContext();
  }

  /**
   * Clear textures
   */
  clearTextures() {
    const l = Utils.INFO.maxTextureImageUnits;

    for (let i = 0; i < l; i++) {
      this._textureMap[i] = null;
      this._emptyTextureSlots[i] = i;
    }

    this.textureIds.length = 0;
  }

  /**
   * Use TextureInfo
   * @param {TextureInfo} textureInfo
   * @param {number} renderTime
   * @param {boolean} forceBind
   * @param {function} callback
   * @returns {number}
   */
  useTexture(textureInfo, renderTime, forceBind = true, callback) {
    if (!textureInfo) return -1;

    let textureId = this._textureMap.indexOf(textureInfo);
    if (textureId < 0) {
      if (!this._emptyTextureSlots.length) {
        callback && callback();
        this.clearTextures();
        textureId = 0;
      } else textureId = this._emptyTextureSlots[0];
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

    this._textureMap[textureId] = textureInfo;

    !this.textureIds.includes(textureId) && this.textureIds.push(textureId);

    removeFromArray(this._emptyTextureSlots, textureId);

    return textureId;
  }

  /**
   * Deactivate TextureInfo
   * @param {TextureInfo} textureInfo
   */
  deactivateTexture(textureInfo) {
    const textureId = this._textureMap.indexOf(textureInfo);
    textureId > -1 && textureInfo.unbindTexture(this.gl, textureId);
  }

  /**
   * Use WebGLProgram
   * @param {WebGLProgram} program
   * @param {Float32Array} vao
   * @returns {boolean}
   */
  useProgram(program, vao) {
    if (this._currentProgram !== program) {
      this._currentProgram = program;
      this.clearTextures();

      const gl = this.gl;
      gl.bindVertexArray(null);
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      return true;
    }
  }

  /**
   * Set canvas size
   * @param {number} width
   * @param {number} height
   */
  setCanvasSize(width, height) {
    const canvas = this.canvas;
    canvas.width = width;
    canvas.height = height;
  }

  /**
   * Set context size
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    if (this._width !== width || this._height !== height) {
      this._width = width;
      this._height = height;

      const gl = this.gl;
      gl.viewport(0, 0, width, height);
      gl.scissor(0, 0, width, height);
    }
  }

  /**
   * @param {Object} event
   * @ignore
   */
  _onContextLost(event) {
    event.preventDefault();
    setTimeout(this._restoreContext, 1);
  }

  /**
   * @ignore
   */
  _initContext() {
    const gl = (this.gl = this.canvas.getContext(
      "webgl2",
      this._config.contextAttributes
    ));

    gl.agl_id = ++this.contextId;

    const loseContextExt = gl.getExtension("WEBGL_lose_context");
    if (loseContextExt) {
      this._restoreContext = loseContextExt.restoreContext.bind(loseContextExt);
      this._loseContext = loseContextExt.loseContext.bind(loseContextExt);
    } else this._restoreContext = this._loseContext = noop;

    this.isLost = gl.isContextLost ? gl.isContextLost.bind(gl) : noopReturnsOne;

    gl.pixelStorei(Const.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(Const.BLEND);
    gl.blendColor(1, 1, 1, 1);
    gl.enable(Const.SCISSOR_TEST);

    this._width =
      this._height =
      this._currentProgram =
      this._currentBlendMode =
        null;

    this._textureMap &&
      this._emptyTextureSlots &&
      this.textureIds &&
      this.clearTextures();
    this.setCanvasSize(1, 1);

    this._textureMap = [];
    this._emptyTextureSlots = [];
    this.textureIds = [];

    this._config.initCallback && setTimeout(this._config.initCallback, 1);
  }
}
