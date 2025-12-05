/**
 * @typedef {Object} SmoothLightRendererConfig
 * @extends {LightRendererConfig}
 * @property {number} blur
 */

/**
 * SmoothLight
 * @extends {AGL.Image}
 */
export class SmoothLight extends AGL.Image {
  /**
   * Creates an instance of SmoothLight.
   * @constructor
   * @param {SmoothLightRendererConfig} config
   */
  constructor(config = {}) {
    super();

    this._framebuffer = new AGL.Framebuffer();

    this.lightRenderer = new AGL.LightRenderer(config);

    this._filter = new AGL.BlurFilter();

    this.filterRenderer = new AGL.FilterRenderer({
      context: this.lightRenderer.context,
      sourceTexture: this._framebuffer,
      filters: [this._filter],
    });
    this.filterRenderer.clearColor.set(0, 0, 0, 0);
    this.filterRenderer.clearBeforeRender = true;

    this.addLightForRender = this.lightRenderer.addLightForRender.bind(
      this.lightRenderer
    );

    this.blendMode = AGL.BlendMode.SHADOW;

    this._filterFramebuffer = new AGL.Framebuffer();
    this.texture = this._filterFramebuffer;

    this.blur = typeof config.blur === "number" ? config.blur : 1;
  }

  /**
   * Set/Get blur value
   * @type {number}
   */
  get blur() {
    return this._blur;
  }
  set blur(v) {
    this._blur = this._filter.intensityX = this._filter.intensityY = v;
  }

  /**
   * Render
   */
  render() {
    this._resizeFunc();
    this.lightRenderer.renderToFramebuffer(this._framebuffer);
    this.filterRenderer.renderToFramebuffer(this._filterFramebuffer);
  }

  /**
   * Set Renderer Size
   * @param {number} w
   * @param {number} h
   */
  setSize(w, h) {
    this._width = w;
    this._height = h;

    this._resizeFunc = this._resize;
  }

  /**
   * @ignore
   */
  _resize() {
    this._resizeFunc = () => {};

    this.lightRenderer.setSize(this._width, this._height);
    this.filterRenderer.setSize(this._width, this._height);
  }
}
