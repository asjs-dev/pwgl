import { TextureInfo } from "./TextureInfo.js";
import { emptyFunction } from "../../utils/helpers.js";

export class Texture extends TextureInfo {
  constructor(source, shouldUpdate) {
    super();

    /*
    this._loaded
    this.isVideo
    */

    this._source = Texture.placeholderImage;

    this._parseTextureSize = this._parseTextureSize.bind(this);

    this.source = source;
    this.shouldUpdate = shouldUpdate;

    this._dimensionWidthName = "width";
    this._dimensionHeightName = "height";

    this._currentRenderTime =
    this._loadUpdateId =
    this._currentLoadUpdateId = 0;

    this._eventType;
  }

  get width() { return this._sourceWidth || 1; }

  get height() { return this._sourceHeight || 1; }

  get source() { return this._source; }
  set source(value) {
    if (value) {
      this._loaded = false;

      this._source.removeEventListener(
        this._eventType,
        this._parseTextureSize
      );

      this._source = value
        ? value
        : Texture.placeholderImage;

      this.isVideo = value.tagName
        ? value.tagName.toLowerCase() === "video"
        : false;
      this._eventType = this.isVideo
        ? "canplay"
        : "load";

      if (value) {
        this._parseTextureSize();

        !this._loaded && value.addEventListener(
          this._eventType,
          this._parseTextureSize
        );
      }
    }
  }

  destruct() {
    this._source.removeEventListener(
      this._eventType,
      this._parseTextureSize
    );
  }

  _isNeedToDraw(gl, id, renderTime) {
    if (this._currentAglId < gl.agl_id) {
      this._currentAglId = gl.agl_id;
      this._baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);
      return true;
    }

    if (this._currentUpdateId < this._updateId) {
      this._currentUpdateId = this._updateId;
      this.useActiveTexture(gl, id);
      return true;
    }

    if (this._currentLoadUpdateId < this._loadUpdateId) {
      this._currentLoadUpdateId = this._loadUpdateId;
      this.useActiveTexture(gl, id);
      return true;
    }

    if (this.shouldUpdate && this._currentRenderTime < renderTime) {
      this._currentRenderTime = renderTime;
      this.useActiveTexture(gl, id);
      return true;
    }

    if (this.isVideo && !this._source.paused) {
      this.useActiveTexture(gl, id);
      return true;
    }

    return false;
  }

  get _sourceWidth() {
    return this._source[this._dimensionWidthName];
  }

  get _sourceHeight() {
    return this._source[this._dimensionHeightName];
  }

  _parseTextureSize() {
    this._dimensionWidthName = "width";
    this._dimensionHeightName = "height";
    if (this._source.naturalWidth) {
      this._dimensionWidthName = "naturalWidth";
      this._dimensionHeightName = "naturalHeight";
    } else if (this._source.videoWidth) {
      this._dimensionWidthName = "videoWidth";
      this._dimensionHeightName = "videoHeight";
    }

    this._loaded = this._sourceWidth * this._sourceHeight > 0;
    if (this._loaded) {
      this._renderSource = this._source;
      ++this._loadUpdateId;
    } else
      this._renderSource = null;
  }
}

Texture.placeholderImage = document.createElement("img");

Texture.loadImage = (src, shouldUpdate) => {
  const image = document.createElement("img");
  const texture = new Texture(image, shouldUpdate);
  image.src = src;
  return texture;
};

Texture.loadVideo = (src, shouldUpdate) => {
  const video = document.createElement("video");
  const texture = new Texture(video, shouldUpdate);
  video.src = src;
  return texture;
};
