import { TextureInfo } from "./TextureInfo";

const _placeholderImage = document.createElement("img");

const _createElement = (tag, src) => {
  const element = document.createElement(tag);
  element.crossOrigin = "anonymous";
  element.src = src;
  return element;
};

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
   * @param {HTMLElement} source - The source of the texture
   * @param {boolean} shouldUpdate - Whether the texture should update every frame
   */
  constructor(source, shouldUpdate) {
    super();

    this._source = _placeholderImage;

    this.updateSize = this.updateSize.bind(this);

    this.source = source;
    this.shouldUpdate = shouldUpdate;

    this._currentRenderTime = 0;
  }

  /**
   * Set/Get source of the texture
   * @type {HTMLElement}
   */
  get source() {
    return this._source;
  }

  set source(value) {
    this.destruct();

    if (value) {
      this._source = value;

      this.isVideo = value.tagName.toLowerCase() === "video";
      this._eventType = this.isVideo ? "canplay" : "load";

      !this.updateSize() &&
        value.addEventListener(this._eventType, this.updateSize, {
          once: true,
        });
    }
  }

  /**
   * Destruct the class
   */
  destruct() {
    this._source &&
      this._source.removeEventListener(this._eventType, this.updateSize);
    this.$renderSource = null;
  }

  /**
   * Use TextureInfo
   * @param {WebGLContext} gl - The WebGL context
   * @param {number} id - The texture id
   * @param {boolean} forceBind - Force bind
   * @param {number} renderTime - The current render time
   */
  use(gl, id, forceBind, renderTime) {
    if (this.$currentAglId < gl.gl_id) {
      this.$currentAglId = gl.gl_id;
      this._baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);
    } else if (
      this.$updated ||
      this._loaded ||
      (this.shouldUpdate && this._currentRenderTime < renderTime) ||
      (this.isVideo && !this._source.paused)
    ) {
      this.$updated = this._loaded = false;
      this._currentRenderTime = renderTime;
      this.useActiveTexture(gl, id);
    } else if (this._currentActiveId !== id || forceBind)
      this.bindActiveTexture(gl, id);
  }

  /**
   * Update texture size
   * @returns {boolean}
   */
  updateSize() {
    const source = this._source,
      sourceWidth = source.videoWidth || source.naturalWidth || source.width,
      sourceHeight =
        source.videoHeight || source.naturalHeight || source.height;

    if (sourceWidth * sourceHeight) {
      this.$width = sourceWidth;
      this.$height = sourceHeight;
      this.$renderSource = this._source;
      return this._loaded = this.$updated = true;
    }
  }
}

/**
 * Create a new Texture from an image source
 * @function
 * @param {HTMLElement} src - The source of the texture
 * @param {boolean} shouldUpdate - Whether the texture should update every frame
 * @returns {Texture}
 */
Texture.loadImage = (src, shouldUpdate) =>
  new Texture(_createElement("img", src), shouldUpdate);

/**
 * Create a new Texture from a video source
 * @function
 * @param {HTMLVideoElement} src - The source of the texture
 * @returns {Texture}
 */
Texture.loadVideo = (src) => new Texture(_createElement("video", src));
