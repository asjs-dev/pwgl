import { Image } from "./Image";
import { layoutText } from "../utils/layoutText";
import { Texture } from "../textures/Texture";
import { noop } from "../../extensions/utils/noop";

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

    const ctx = this._ctx,
      canvas = this._canvas,
      align = this._align,
      fontSize = this._fontSize,
      lineHeight = this._lineHeight * fontSize,
      maxWidth = this.transform.width;

    canvas.width = this.transform.width;
    canvas.height = this.transform.height;

    ctx.font = fontSize + "px " + this._fontFamily;
    ctx.textBaseline = "top";
    ctx.textAlign = align;
    ctx.fillStyle = this._fontColor;

    const lines = layoutText(ctx, this._text, maxWidth),
      x = align === "center" ? maxWidth / 2 : align === "right" ? maxWidth : 0;

    for (let i = 0, l = lines.length; i < l; i++) {
      const line = lines[i],
        y = lineHeight * i;

      ctx.fillText(line, x, y);
    }

    this.texture.updateSize();
  }
}
