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

    this.$source = _placeholderImage;

    this.updateSize = this.updateSize.bind(this);

    this.source = source;
    this.shouldUpdate = shouldUpdate;

    this.$currentRenderTime = 0;
  }

  /**
   * Set/Get source of the texture
   * @type {HTMLElement}
   */
  get source() {
    return this.$source;
  }

  set source(value) {
    this.destruct();

    if (value) {
      this.$source = value;

      this.isVideo = value.tagName.toLowerCase() === "video";
      this.$eventType = this.isVideo ? "canplay" : "load";

      !this.updateSize() &&
        value.addEventListener(this.$eventType, this.updateSize, {
          once: true,
        });
    }
  }

  /**
   * Destruct the class
   */
  destruct() {
    const { $source } = this;
    $source && $source.removeEventListener(this.$eventType, this.updateSize);
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
      this.$baseTexture = gl.createTexture();
      this.useActiveTexture(gl, id);
      this.$updated = this.$loaded = false;
      this.$currentRenderTime = renderTime;
    } else if (
      this.$updated ||
      this.$loaded ||
      ((this.shouldUpdate || (this.isVideo && !this.$source.paused)) && this.$currentRenderTime < renderTime)
    ) {
      this.$updated = this.$loaded = false;
      this.$currentRenderTime = renderTime;
      this.useActiveTexture(gl, id);
    } else if (this.$currentActiveId !== id || forceBind) {
      this.bindActiveTexture(gl, id);
    }
  }

  /**
   * Update texture size
   * @returns {boolean}
   */
  updateSize() {
    const { $source } = this;
    const sourceWidth = $source.videoWidth || $source.naturalWidth || $source.width;
    const sourceHeight = $source.videoHeight || $source.naturalHeight || $source.height;

    if (sourceWidth * sourceHeight) {
      this.$width = sourceWidth;
      this.$height = sourceHeight;
      this.$renderSource = $source;
      return (this.$loaded = this.$updated = true);
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
Texture.loadImage = (src, shouldUpdate) => new Texture(_createElement("img", src), shouldUpdate);

/**
 * Create a new Texture from a video source
 * @function
 * @param {HTMLVideoElement} src - The source of the texture
 * @returns {Texture}
 */
Texture.loadVideo = (src) => new Texture(_createElement("video", src));
