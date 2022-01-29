import { TextureInfo } from "./TextureInfo.js";
import { Const } from "../../utils/Utils.js";

export class Framebuffer extends TextureInfo {
  get width() { return this._width; }
  set width(v) {
    if (this._width !== v && v > 0) {
      this._width = v;
      ++this._updateId;
    }
  }

  get height() { return this._height; }
  set height(v) {
    if (this._height !== v && v > 0) {
      this._height = v;
      ++this._updateId;
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

  use(gl, id, forceBind) {
    if (
      this._isNeedToDraw(gl, id) ||
      this._currenActivetId !== id ||
      forceBind
    ) this.bindActiveTexture(gl, id);
  }

  _isNeedToDraw(gl, id) {
    let result = false;

    if (this._currentAglId < gl.agl_id) {
      this._currentAglId = gl.agl_id;

      this._framebuffer = gl.createFramebuffer();

      this._baseTexture = gl.createTexture();

      this.useActiveTexture(gl, id);

      this.bind(gl);

      gl.framebufferTexture2D(
        Const.FRAMEBUFFER,
        Const.COLOR_ATTACHMENT0,
        Const.TEXTURE_2D,
        this._baseTexture,
        0
      );

      this.unbind(gl);

      result = true;
    }

    if (this._currentUpdateId < this._updateId) {
      this._currentUpdateId = this._updateId;
      this.useActiveTexture(gl, id);
      result = true;
    }

    return result;
  }
}
