import { BlendMode } from "../data/BlendMode.js";
import { TextureProps } from "../data/props/TextureProps.js";
import { TextureCrop } from "../data/props/TextureCrop.js";
import { DistortionProps } from "../data/props/DistortionProps.js";
import { Matrix3 } from "../geom/Matrix3.js";
import { BaseDrawable } from "./BaseDrawable.js";

export class Image extends BaseDrawable {
  constructor(texture) {
    super();

    /*
    this.interactive
    */

    this.TYPE = Image.TYPE;

    this.textureMatrixCache = Matrix3.identity();

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

  update() {
    this._updateProps();
    this._updateTexture();
    this.textureCrop.updateCrop();
  }

  isContainsPoint(point) {
    this._updateAdditionalData();
    return Matrix3.isPointInMatrix(this._inverseMatrixCache, point);
  }

  _updateTexture() {
    const props = this.textureProps;
    props.updateRotation();

    if (this._currentTexturePropsUpdateId < props.updateId) {
      this._currentTexturePropsUpdateId = props.updateId;

      Matrix3.transformLocal(props, this.textureMatrixCache);
    }
  }
}

Image.TYPE = "drawable";

Image.TintType = {
  NONE: 0,
  NORMAL: 1,
  GRAYSCALE: 2,
  OVERRIDE: 3,
  ADD: 4,
};
