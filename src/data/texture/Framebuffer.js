import { TextureInfo } from "./TextureInfo.js";
import { Const } from "../../utils/Utils.js";

export class Framebuffer extends TextureInfo {
  constructor() {
    super();

    this._resizeUpdateId =
    this._currentResizeUpdateId = 0;
  }

  get width() { return this._width; }
  set width(v) {
    if (this._width !== v && v > 0) {
      this._width = v;
      ++this._resizeUpdateId;
    }
  }

  get height() { return this._height; }
  set height(v) {
    if (this._height !== v && v > 0) {
      this._height = v;
      ++this._resizeUpdateId;
    }
  }

  setSize(w, h) {
    this.width  = w;
    this.height = h;
  }

  bind(gl) {
    gl.bindFramebuffer(Const.FRAMEBUFFER, this._framebuffer);
  }

  unbind(gl) {
    gl.bindFramebuffer(Const.FRAMEBUFFER, null);
  }

  _isNeedToDraw(gl, id) {
    if (this._currentAglId < gl.agl_id) {
      this._currentAglId = gl.agl_id;
      this._baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);

      this._framebuffer = gl.createFramebuffer();

      this.bind(gl);

      gl.framebufferTexture2D(
        Const.FRAMEBUFFER,
        Const.COLOR_ATTACHMENT0,
        Const.TEXTURE_2D,
        this._baseTexture,
        0
      );

      this.unbind(gl);

      return true;
    }

    if (this._currentUpdateId < this._updateId) {
      this._currentUpdateId = this._updateId;
      this.useActiveTextureAfterUpdate(gl, id);
      return true;
    }

    if (this._currentResizeUpdateId < this._resizeUpdateId) {
      this._currentResizeUpdateId = this._resizeUpdateId;
      this.useActiveTexture(gl, id);
      return true;
    }

    return false;
  }
}
