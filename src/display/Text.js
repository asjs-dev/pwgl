import { noop } from "../../extensions/utils/noop";
import { Texture } from "../textures/Texture";
import { layoutText } from "../utils/layoutText";
import { Image } from "./Image";

/**
 * Text drawable class
 * @extends {Image}
 */
export class Text extends Image {
  /**
   * Creates an instance of Text.
   * @constructor
   * @param {string} text
   * @param {object} options
   */
  constructor(text = "", options = {}) {
    const canvas = document.createElement("canvas");

    super(new Texture(canvas, true));

    this._canvas = canvas;
    this._ctx = canvas.getContext("2d", {
      alpha: true,
    });

    this.text = text;
    this.fontSize = options.fontSize ?? 12;
    this.lineHeight = options.lineHeight ?? 1.3;
    this.fontFamily = options.fontFamily ?? "sans-serif";
    this.fontColor = options.fontColor ?? "#000";
    this.align = options.align ?? "left";
  }

  /**  * Set/Get text
   * @type {string}
   */
  get text() {
    return this._text;
  }

  set text(v) {
    this._text = v;
    this._updateFv = this._updateTexture;
  }

  /**
   * Set/Get font size
   * @type {number}
   */
  get fontSize() {
    return this._fontSize;
  }

  set fontSize(v) {
    this._fontSize = v;
    this._updateFv = this._updateTexture;
  }

  /**
   * Set/Get font family
   * @type {string}
   */
  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(v) {
    this._fontFamily = v;
    this._updateFv = this._updateTexture;
  }

  /**
   * Set/Get font color
   * @type {string}
   */
  get fontColor() {
    return this._fontColor;
  }

  set fontColor(v) {
    this._fontColor = v;
    this._updateFv = this._updateTexture;
  }

  /**
   * Set/Get text align
   * @type {string}
   */
  get align() {
    return this._align;
  }

  set align(v) {
    this._align = v;
    this._updateFv = this._updateTexture;
  }

  /**
   * Set/Get line height (multiplier of font size)
   * @type {number}
   */
  get lineHeight() {
    return this._lineHeight;
  }

  set lineHeight(v) {
    this._lineHeight = v;
    this._updateFv = this._updateTexture;
  }

  update() {
    super.update();
    this.transformUpdated ? this._updateTexture() : this._updateFv();
  }

  _updateTexture() {
    this._updateFv = noop;

    const { _ctx, _canvas, _align, _fontSize, _lineHeight, transform } = this;
    const lineHeight = _lineHeight * _fontSize;
    const maxWidth = transform.width;

    _canvas.width = transform.width;
    _canvas.height = transform.height;

    _ctx.font = _fontSize + "px " + this._fontFamily;
    _ctx.textBaseline = "top";
    _ctx.textAlign = _align;
    _ctx.fillStyle = this._fontColor;

    const lines = layoutText(_ctx, this._text, maxWidth);
    const x = _align === "center" ? maxWidth / 2 : _align === "right" ? maxWidth : 0;

    for (let i = 0, l = lines.length; i < l; i++) {
      const line = lines[i];
      const y = lineHeight * i;

      _ctx.fillText(line, x, y);
    }

    this.texture.updateSize();
  }
}
