import { BlendMode } from "../data/BlendMode";
import { TextureProps } from "../data/props/TextureProps";
import { TextureCrop } from "../data/props/TextureCrop";
import { DistortionProps } from "../data/props/DistortionProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { BaseDrawable } from "./BaseDrawable";
import "../geom/PointUtilities";
import { TextureInfo } from "../data/texture/TextureInfo";

/**
 * Image class
 * @extends {BaseDrawable}
 */
export class Image extends BaseDrawable {
  /**
   * Creates an instance of Image.
   * @constructor
   * @param {TextureInfo} texture
   */
  constructor(texture) {
    super();

    this.TYPE = Image.TYPE;

    this.textureMatrixCache = Matrix3Utilities.identity();

    this.tintType = Image.TintType.NONE;
    this.blendMode = BlendMode.NORMAL;

    this.textureProps = new TextureProps();
    this.textureCrop = new TextureCrop();
    this.distortionProps = new DistortionProps();

    this._currentTexturePropsUpdateId = 0;

    this.textureCropCache = this.textureCrop.items;
    this.textureRepeatRandomCache = this.textureProps.items;
    this.distortionPropsCache = this.distortionProps.items;
    this.colorCache = this.color.items;

    this.texture = texture;
  }

  /**
   * Update Image
   */
  update() {
    this.$updateProps();
    this._updateTexture();
    this.textureCrop.updateCrop();
  }

  /**
   * Returns true if the Image contains the point
   * @param {Point} point
   * @returns {boolean}
   */
  isContainsPoint(point) {
    this.$updateInverseMatrixCache();
    return Matrix3Utilities.isPointInMatrix(this.$inverseMatrixCache, point);
  }

  /**
   * @ignore
   */
  _updateTexture() {
    const props = this.textureProps;
    props.updateRotation();

    if (this._currentTexturePropsUpdateId < props.updateId) {
      this._currentTexturePropsUpdateId = props.updateId;

      Matrix3Utilities.transformLocal(props, this.textureMatrixCache);
    }
  }
}

/**
 * Type "drawable"
 * @string
 */
Image.TYPE = "drawable";

/**
 * Tint type
 * @member
 * @property {number} NONE output color = source color * 1 + tint color * 0
 * @property {number} NORMAL output color = source color * tint color
 * @property {number} GRAYSCALE output color = if source color red channel == source color green channel and source color red channel == source color blue channel then source color red channel * tint color else source color
 * @property {number} OVERRIDE output color = tint color
 * @property {number} ADD output color = source color + tint color
 */
Image.TintType = {
  NONE: 0,
  NORMAL: 1,
  GRAYSCALE: 2,
  OVERRIDE: 3,
  ADD: 4,
};
