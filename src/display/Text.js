import { noop } from "../../common/utils/noop";
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

    super(new Texture(canvas));

    this.$canvas = canvas;
    this.$ctx = canvas.getContext("2d", {
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
    return this.$text;
  }

  set text(v) {
    this.$text = v;
    this.$updateFv = this.$updateTexture;
  }

  /**
   * Set/Get font size
   * @type {number}
   */
  get fontSize() {
    return this.$fontSize;
  }

  set fontSize(v) {
    this.$fontSize = v;
    this.$updateFv = this.$updateTexture;
  }

  /**
   * Set/Get font family
   * @type {string}
   */
  get fontFamily() {
    return this.$fontFamily;
  }

  set fontFamily(v) {
    this.$fontFamily = v;
    this.$updateFv = this.$updateTexture;
  }

  /**
   * Set/Get font color
   * @type {string}
   */
  get fontColor() {
    return this.$fontColor;
  }

  set fontColor(v) {
    this.$fontColor = v;
    this.$updateFv = this.$updateTexture;
  }

  /**
   * Set/Get text align
   * @type {string}
   */
  get align() {
    return this.$align;
  }

  set align(v) {
    this.$align = v;
    this.$updateFv = this.$updateTexture;
  }

  /**
   * Set/Get line height (multiplier of font size)
   * @type {number}
   */
  get lineHeight() {
    return this.$lineHeight;
  }

  set lineHeight(v) {
    this.$lineHeight = v;
    this.$updateFv = this.$updateTexture;
  }

  update() {
    super.update();

    const { transform } = this;

    // Only a size change needs a redraw; position, rotation and parent changes reuse the texture.
    this.transformUpdated && (transform.width !== this.$drawnWidth || transform.height !== this.$drawnHeight)
      ? this.$updateTexture()
      : this.$updateFv();
  }

  $updateTexture() {
    this.$updateFv = noop;

    const { $ctx, $canvas, $align, $fontSize, $lineHeight, transform } = this;
    const lineHeight = $lineHeight * $fontSize;
    const maxWidth = (this.$drawnWidth = transform.width);

    $canvas.width = maxWidth;
    $canvas.height = this.$drawnHeight = transform.height;

    $ctx.font = $fontSize + "px " + this.$fontFamily;
    $ctx.textBaseline = "top";
    $ctx.textAlign = $align;
    $ctx.fillStyle = this.$fontColor;

    const lines = layoutText($ctx, this.$text, maxWidth);
    const x = $align === "center" ? maxWidth / 2 : $align === "right" ? maxWidth : 0;

    for (let i = 0, l = lines.length; i < l; i++) {
      const line = lines[i];
      const y = lineHeight * i;

      $ctx.fillText(line, x, y);
    }

    this.texture.updateSize();
  }
}
