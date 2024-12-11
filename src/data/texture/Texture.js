import { TextureInfo } from "./TextureInfo";
import "../../utils/Utils";

const _placeholderImage = document.createElement("img");

/**
 * Texture
 * @extends {TextureInfo}
 * @property {boolean} isVideo
 * @property {boolean} shouldUpdate
 */
export class Texture extends TextureInfo {
  /**
   * Creates an instance of Texture.
   * @constructor
   * @param {HTMLElement} source
   * @param {boolean} shouldUpdate
   */
  constructor(source, shouldUpdate) {
    super();

    this._source = _placeholderImage;

    this._parseTextureSize = this._parseTextureSize.bind(this);

    this.isVideo = false;

    this.source = source;
    this.shouldUpdate = shouldUpdate;

    this._dimensionWidthName = "width";
    this._dimensionHeightName = "height";

    this._currentRenderTime =
      this._loadUpdateId =
      this._currentLoadUpdateId =
        0;

    this._eventType;
  }

  /**
   * Get width
   * @readonly
   * @type {number}
   */
  get width() {
    return this._sourceWidth || 1;
  }

  /**
   * Get height
   * @readonly
   * @type {number}
   */
  get height() {
    return this._sourceHeight || 1;
  }

  /**
   * Set/Get source of the texture
   * @type {HTMLElement}
   */
  get source() {
    return this._source;
  }

  set source(value) {
    if (value) {
      this._source.removeEventListener(this._eventType, this._parseTextureSize);

      this._source = value;

      this.isVideo = value.tagName.toLowerCase() === "video";
      this._eventType = this.isVideo ? "canplay" : "load";

      !this._parseTextureSize() &&
        value.addEventListener(this._eventType, this._parseTextureSize, {
          once: true,
        });
    }
  }

  /**
   * Destruct the class
   */
  destruct() {
    this._source.removeEventListener(this._eventType, this._parseTextureSize);
  }

  /**
   * Use TextureInfo
   * @param {WebGLContext} gl
   * @param {number} id
   * @param {boolean} forceBind
   * @param {number} renderTime
   */
  use(gl, id, forceBind, renderTime) {
    if (this.$currentAglId < gl.agl_id) {
      this.$currentAglId = gl.agl_id;
      this._baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);
      return;
    }

    if (this.$currentUpdateId < this.$updateId) {
      this.$currentUpdateId = this.$updateId;
      this.useActiveTexture(gl, id);
      return;
    }

    if (this._currentLoadUpdateId < this._loadUpdateId) {
      this._currentLoadUpdateId = this._loadUpdateId;
      this.useActiveTexture(gl, id);
      return;
    }

    if (this.shouldUpdate && this._currentRenderTime < renderTime) {
      this._currentRenderTime = renderTime;
      this.useActiveTexture(gl, id);
      return;
    }

    if (this.isVideo && !this._source.paused) {
      this.useActiveTexture(gl, id);
      return;
    }

    if (this._currenActiveId !== id || forceBind)
      this.bindActiveTexture(gl, id);
  }

  /**
   * @readonly
   * @type {number}
   * @ignore
   */
  get _sourceWidth() {
    return this._source[this._dimensionWidthName];
  }

  /**
   * @readonly
   * @type {number}
   * @ignore
   */
  get _sourceHeight() {
    return this._source[this._dimensionHeightName];
  }

  /**
   * @ignore
   */
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

    if (this._sourceWidth * this._sourceHeight > 0) {
      this._renderSource = this._source;
      ++this._loadUpdateId;
      return true;
    } else this._renderSource = null;
  }
}

/**
 * Create a new Texture from an image source
 * @function
 * @param {HTMLElement} src
 * @param {boolean} shouldUpdate
 * @returns {Texture}
 */
Texture.loadImage = (src, shouldUpdate) => {
  const image = document.createElement("img");
  const texture = new Texture(image, shouldUpdate);
  image.src = src;
  return texture;
};

/**
 * Create a new Texture from a video source
 * @function
 * @param {HTMLVideoElement} src
 * @param {boolean} shouldUpdate
 * @returns {Texture}
 */
Texture.loadVideo = (src, shouldUpdate) => {
  const video = document.createElement("video");
  const texture = new Texture(video, shouldUpdate);
  video.src = src;
  return texture;
};
