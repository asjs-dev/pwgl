import { emptyFunction } from "../utils/helpers.js";
import { BlendMode } from "../data/BlendMode.js";
import { Framebuffer } from "../data/texture/Framebuffer.js";
import { Texture } from "../data/texture/Texture.js";
import { BlurFilter } from "../filters/BlurFilter.js";
import { FilterRenderer } from "../renderer/FilterRenderer.js";
import { LightRenderer } from "../renderer/LightRenderer.js";
import { Image } from "./Image.js";

export class SmoothLight extends Image {
  constructor(options) {
    super();
    
    options = options || {};

    this._framebuffer = new Framebuffer();

    this.lightRenderer = new LightRenderer(options);
    this.lightRenderer.clearColor.set(0, 0, 0, 1);
    this.lightRenderer.clearBeforeRender = true;

    this._blurFilter = new BlurFilter();

    this.filterRenderer = new FilterRenderer({
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

    this.blendMode = BlendMode.MULTIPLY;

    if (!options.config.context) {
      this.texture = new Texture(
        this.filterRenderer.context.canvas,
        true
      );
      this._renderFilterFuncBound = this._renderFilter.bind(this);
    } else {
      this._filterFramebuffer = new Framebuffer();
      this.texture = this._filterFramebuffer;
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
    super.destruct();
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

    this.props.width = this._width;
    this.props.height = this._height;

    this.lightRenderer.setSize(scaledWidth, scaledHeight);
    this.filterRenderer.setSize(scaledWidth, scaledHeight);
  }
}
