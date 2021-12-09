import { emptyFunction } from "../utils/helpers.js";
import "../namespace.js";

AGL.SmoothLight = class {
  constructor(options) {
    options = options || {};

    this._framebuffer = new AGL.Framebuffer();

    this.lightRenderer = new AGL.LightRenderer(options);
    this.lightRenderer.clearColor.set(0, 0, 0, 1);
    this.lightRenderer.clearBeforeRender = true;

    this._blurFilter = new AGL.BlurFilter();

    this.filterRenderer = new AGL.FilterRenderer({
      config : {
        context : this.lightRenderer.context,
      },
      texture : this._framebuffer,
      filters : [
        this._blurFilter
      ]
    });
    this.filterRenderer.clearColor.set(0, 0, 0, 0);
    this.filterRenderer.clearBeforeRender = true;

    this.image = new AGL.Image();
    this.image.blendMode = AGL.BlendMode.MULTIPLY;

    if (!options.config.context) {
      this.image.texture = new AGL.Texture(
        this.filterRenderer.context.canvas,
        true
      );
      this._renderFilterFuncBound = this._renderFilter.bind(this);
    } else {
      this._filterFramebuffer = new AGL.Framebuffer();
      this.image.texture = this._filterFramebuffer;
      this._renderFilterFuncBound = this._renderFilterToFramebuffer.bind(this);
    }

    this.blur = typeof options.blur === "number"
      ? options.blur
      : 1;
  }

  get scale() { return this.lightRenderer.scale; }
  set scale(v) {
    if (this.lightRenderer.scale !== v) {
      this.lightRenderer.scale = v;
      this._resizeFunc = this._resize;
    }
  }

  get blur() { return this._blur; }
  set blur(v) {
    this._blur =
    this._blurFilter.intensityX =
    this._blurFilter.intensityY = v;
  }

  render() {
    this._resizeFunc();
    this.lightRenderer.renderToFramebuffer(this._framebuffer);
    this._renderFilterFuncBound();
  }

  setSize(w, h) {
    this._width = w;
    this._height = h;

    this._resizeFunc = this._resize;
  }

  destruct() {
    this.lightRenderer.destruct();
    this.filterRenderer.destruct();
    this.image.destruct();
  }

  _renderFilter() {
    this.filterRenderer.render();
  }

  _renderFilterToFramebuffer() {
    this.filterRenderer.renderToFramebuffer(this._filterFramebuffer);
  }

  _resize() {
    this._resizeFunc = emptyFunction;

    const scaledWidth = this._width * this.lightRenderer.scale;
    const scaledHeight = this._height * this.lightRenderer.scale;

    this.image.props.width = this._width;
    this.image.props.height = this._height;

    this.lightRenderer.setSize(scaledWidth, scaledHeight);
    this.filterRenderer.setSize(scaledWidth, scaledHeight);
  }
}
