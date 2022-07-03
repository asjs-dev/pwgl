import { removeFromArray } from "./helpers.js";
import { Utils, Const } from "./Utils.js";

export class Context {
  constructor(config) {
    /*
    this._currentProgram
    this._currentBlendMode
    this._width
    this._height
    */

    this.contextId = 0;

    this._config = Utils.initContextConfig(config || {});
    this.canvas = this._config.canvas;

    this._MAX_TEXTURE_NUM = Utils.INFO.maxTextureImageUnits;

    this._onContextLostBound = this._onContextLost.bind(this);
    this._onContextRestoredBound = this._initContext.bind(this);
    this._restoreContextBound = this._restoreContext.bind(this);

    this.canvas.addEventListener("webglcontextlost", this._onContextLostBound);
    this.canvas.addEventListener(
      "webglcontextrestored",
      this._onContextRestoredBound
    );

    this._initContext();
  }

  isLost() {
    return this.gl && this.gl.isContextLost && this.gl.isContextLost();
  }

  useBlendMode(blendMode) {
    this._currentBlendMode = blendMode;

    this.gl[blendMode.equationName].apply(this.gl, blendMode.equations);
    this.gl[blendMode.functionName].apply(this.gl, blendMode.functions);
  }

  setBlendMode(blendMode, drawCallback) {
    if (this._currentBlendMode !== blendMode) {
      drawCallback && drawCallback();
      this.useBlendMode(blendMode);
    }
  }

  destruct() {
    this.gl.useProgram(null);

    this.canvas.removeEventListener(
      "webglcontextlost",
      this._onContextLostBound
    );
    this.canvas.removeEventListener(
      "webglcontextrestored",
      this._onContextRestoredBound
    );

    this._loseContextExt && this._loseContextExt.loseContext();
  }

  clearTextures() {
    for (let i = 0; i < this._MAX_TEXTURE_NUM; ++i) {
      this._textureMap[i] = null;
      this._emptyTextureSlots[i] = i;
    }

    this.textureIds.length = 0;
  }

  useTexture(textureInfo, renderTime, forceBind, callback) {
    if (!textureInfo)
      return -1;

    let textureId = this._textureMap.indexOf(textureInfo);
    if (textureId < 0) {
      textureId = this._emptyTextureSlots[0];
      forceBind = true;
    }

    if (this._emptyTextureSlots.length < 1) {
      callback && callback();
      this.clearTextures();
      textureId = 0;
      forceBind = true;
    }

    return this.useTextureAt(textureInfo, textureId, renderTime, forceBind);
  }

  useTextureAt(textureInfo, textureId, renderTime, forceBind) {
    textureInfo.use(this.gl, textureId, forceBind, renderTime);

    this._textureMap[textureId] = textureInfo;

    this.textureIds.indexOf(textureId) < 0 && this.textureIds.push(textureId);

    removeFromArray(this._emptyTextureSlots, textureId);

    return textureId;
  }

  deactivateTexture(textureInfo) {
    const textureId = this._textureMap.indexOf(textureInfo);
    textureId > -1 && textureInfo.unbindTexture(this.gl, textureId);
  }

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
    return false;
  }

  setCanvasSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  setSize(width, height) {
    if (this._width !== width || this._height !== height) {
      this._width = width;
      this._height = height;

      this.gl.viewport(0, 0, width, height);
      this.gl.scissor(0, 0, width, height);
    }
  }

  _onContextLost(event) {
    event.preventDefault();
    this._loseContextExt && setTimeout(this._restoreContextBound, 1);
  }

  _restoreContext() {
    this._loseContextExt.restoreContext();
  }

  _initContext() {
    const gl =
    this.gl = this.canvas.getContext("webgl2", this._config.contextAttributes);

    gl.agl_id = ++this.contextId;

    this._loseContextExt = gl.getExtension('WEBGL_lose_context');

    gl.pixelStorei(Const.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(Const.BLEND);
    gl.enable(Const.SCISSOR_TEST);

    this._width =
    this._height =
    this._currentProgram =
    this._currentBlendMode = null;

    this._textureMap = [];
    this._emptyTextureSlots = [];
    this.textureIds = [];

    this.clearTextures();

    this.setCanvasSize(1, 1);

    this._config.initCallback && setTimeout(this._config.initCallback, 1);
  }
}
