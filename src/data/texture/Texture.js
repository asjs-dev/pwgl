import "../../namespace.js";
import "./TextureInfo.js";

const _placeholderImage = new Image();

AGL.Texture = class extends AGL.TextureInfo {
  constructor(source, shouldUpdate) {
    super();

    /*
    this._source
    this._loaded
    this.isVideo
    */

    this._onTextureLoadedBound = this._parseTextureSize.bind(this);

    this.source = source;
    this.shouldUpdate = shouldUpdate;

    this._dimensionWidthName = "width";
    this._dimensionHeightName = "height";

    this._currentRenderTime = 0;

    this._eventType;
  }

  get width() { return this._sourceWidth || 1; }

  get height() { return this._sourceHeight || 1; }

  get source() { return this._source; }
  set source(value) {
    if (value) {
      this._loaded = false;

      this._source && this._source.removeEventListener(
        this._eventType,
        this._onTextureLoadedBound
      );

      if (value) {
        this._source = value;

        this.isVideo = value.tagName
          ? value.tagName.toLowerCase() === "video"
          : false;
        this._eventType = this.isVideo
          ? "canplay"
          : "load";

        this._parseTextureSize();

        !this._loaded && value.addEventListener(
          this._eventType,
          this._onTextureLoadedBound
        );
      } else
        this._source = _placeholderImage;
    }
  }

  use(gl, id, renderTime, forceBind) {
    if (this._isNeedToDraw(gl, renderTime))
      this.useActiveTexture(gl, id);
    else if (this._currenActivetId !== id || forceBind)
      this.bindActiveTexture(gl, id);
  }

  destruct() {
    this._source.removeEventListener(
      this._eventType,
      this._onTextureLoadedBound
    );
  }

  _isNeedToDraw(gl, renderTime) {
    if (this._currentAglId < gl.agl_id) {
      this._currentAglId = gl.agl_id;

      this._baseTexture = gl.createTexture();

      return true;
    }

    if (this.shouldUpdate && this._currentRenderTime < renderTime) {
      this._currentRenderTime = renderTime;
      return true;
    }

    if (this._currentUpdateId < this._updateId) {
      this._currentUpdateId = this._updateId;
      return true;
    }

    if (this.isVideo && !this._source.paused)
      return true;

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
      ++this._updateId;
    } else
      this._renderSource = null;
  }
}

AGL.Texture.loadImage = (src, shouldUpdate) => {
  const image = document.createElement("img");
  const texture = new AGL.Texture(image, shouldUpdate);
  image.src = src;
  return texture;
};

AGL.Texture.loadVideo = (src, shouldUpdate) => {
  const video = document.createElement("video");
  const texture = new AGL.Texture(video, shouldUpdate);
  video.src = src;
  return texture;
};
