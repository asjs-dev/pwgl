import { BaseDrawable } from "./BaseDrawable";
import { BlendMode } from "../rendering/BlendMode";
import { TintType } from "../rendering/TintType";
import { TextureTransform } from "../attributes/TextureTransform";
import { TextureCrop } from "../attributes/TextureCrop";
import { Distortion } from "../attributes/Distortion";
import { TextureInfo } from "../textures/TextureInfo";
import { Matrix3Utilities } from "../math/Matrix3Utilities";
import "../math/PointType";

/**
 * Image class
 * @extends {BaseDrawable}
 * @property {TintType} tintType
 * @property {BlendMode} blendMode
 * @property {TextureTransform} textureTransform
 * @property {TextureCrop} textureCrop
 * @property {Distortion} distortion
 * @property {TextureInfo} texture
 * @property {Array<number>} textureMatrixCache
 * @property {Array<number>} textureCropCache
 * @property {Array<number>} textureRepeatRandomCache
 * @property {Array<number>} distortionCache
 */
export class Image extends BaseDrawable {
  /**
   * Creates an instance of Image.
   * @constructor
   * @param {TextureInfo} texture
   */
  constructor(texture) {
    super();

    this.RENDERING_TYPE = Image.RENDERING_TYPE;

    this.texture = texture;
    this.tintType = TintType.MULTIPLY;
    this.blendMode = BlendMode.NORMAL;
    this._inverseMatrixCache = new Float32Array(6);
    this.textureMatrixCache = Matrix3Utilities.identity();
    this.textureTransform = new TextureTransform();
    this.textureCrop = new TextureCrop();
    this.distortion = new Distortion();
    this.textureCropCache = this.textureCrop.cache;
    this.textureRepeatRandomCache = this.textureTransform.repeatRandomCache;
    this.distortionCache = this.distortion.cache;
  }

  /**
   * Update Image
   */
  update() {
    super.update();
    this.textureCrop.update();

    const textureTransform = this.textureTransform;
    textureTransform.update();

    textureTransform.updated &&
      Matrix3Utilities.transformLocal(
        this.textureMatrixCache,
        textureTransform
      );

    this.interactive && this.transformUpdated &&
      Matrix3Utilities.inverse(this._inverseMatrixCache, this.matrixCache);
  }

  /**
   * Returns true if the Image contains the point
   * @param {Point} point
   * @returns {boolean}
   */
  isContainsPoint(point) {
    return Matrix3Utilities.isPointInMatrix(this._inverseMatrixCache, point);
  }
}

/**
 * Type "drawable"
 * @string
 */
Image.RENDERING_TYPE = "drawable";
