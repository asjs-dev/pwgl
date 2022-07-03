export class SmoothLight extends AGL.Image {
  constructor(options) {
    super();

    options = options || {};

    this._framebuffer = new AGL.Framebuffer();

    this.lightRenderer = new AGL.LightRenderer(options);

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

    this.getLight = this.lightRenderer.getLight.bind(this.lightRenderer);

    this.blendMode = AGL.BlendMode.MULTIPLY;

    this._filterFramebuffer = new AGL.Framebuffer();
    this.texture = this._filterFramebuffer;

    this.blur = typeof options.blur === "number"
      ? options.blur
      : 1;
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
    this.filterRenderer.renderToFramebuffer(this._filterFramebuffer);
  }

  setSize(w, h) {
    this._width = w;
    this._height = h;

    this._resizeFunc = this._resize;
  }

  _resize() {
    this._resizeFunc = () => {};

    this.props.width = this._width;
    this.props.height = this._height;

    this.lightRenderer.setSize(this._width, this._height);
    this.filterRenderer.setSize(this._width, this._height);
  }
}
