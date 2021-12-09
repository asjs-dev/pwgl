import "../namespace.js";
import "../data/BlendMode.js";
import "../data/props/TextureProps.js";
import "../data/props/TextureCrop.js";
import "../data/props/DistortionProps.js";
import "./BaseDrawable.js";

AGL.Image = class extends AGL.BaseDrawable {
  constructor(texture) {
    super();

    /*
    this.interactive
    */

    this.TYPE = AGL.Image.TYPE;

    this.textureMatrixCache = AGL.Matrix3.identity();

    this.tintType = AGL.Image.TintType.NONE;
    this.blendMode = AGL.BlendMode.NORMAL;

    this.textureProps = new AGL.TextureProps();
    this.textureCrop = new AGL.TextureCrop();
    this.distortionProps = new AGL.DistortionProps();

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
    return AGL.Matrix3.isPointInMatrix(this._inverseMatrixCache, point);
  }

  _updateTexture() {
    const props = this.textureProps;
    props.updateRotation();

    if (this._currentTexturePropsUpdateId < props.updateId) {
      this._currentTexturePropsUpdateId = props.updateId;

      AGL.Matrix3.transformLocal(props, this.textureMatrixCache);
    }
  }
}

AGL.Image.TYPE     = "drawable";

AGL.Image.TintType = {
  NONE : 0,
  NORMAL : 1,
  GRAYSCALE : 2,
  OVERRIDE : 3
};
