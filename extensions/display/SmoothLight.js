import { noop } from "../utils/noop";

/**
 * @typedef {Object} SmoothLightRendererConfig
 * @extends {LightRendererConfig}
 * @property {number} blur
 */

/**
 * Renders smooth light effects using PWGL.LightRenderer and PWGL.BlurFilter
 * @class SmoothLight
 * @extends {PWGL.Image}
 */

export const SmoothLight = window.PWGL
  ? class SmoothLight extends PWGL.Image {
      /**
       * Creates an instance of SmoothLight.
       * @constructor
       * @param {SmoothLightRendererConfig} config - Configuration object
       */
      constructor(config = {}) {
        super();

        this._framebuffer = new PWGL.Framebuffer();

        this.lightRenderer = new PWGL.LightRenderer(config);

        this._filter = new PWGL.BlurFilter();

        this.filterRenderer = new PWGL.FilterRenderer({
          context: this.lightRenderer.context,
          sourceTexture: this._framebuffer,
          filters: [this._filter],
        });
        this.filterRenderer.clearColor.set(0, 0, 0, 0);
        this.filterRenderer.clearBeforeRender = true;

        this.addLightForRender = this.lightRenderer.addLightForRender.bind(
          this.lightRenderer
        );

        this.blendMode = PWGL.BlendMode.SHADOW;

        this._filterFramebuffer = new PWGL.Framebuffer();
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
        this._blur = this._filter.intensity = v;
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
       * @param {number} w - Width
       * @param {number} h - Height
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
        this._resizeFunc = noop;

        this.lightRenderer.setSize(this._width, this._height);
        this.filterRenderer.setSize(this._width, this._height);
      }
    }
  : null;
