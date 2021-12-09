import "../namespace.js";
import "../data/props/FilterTextureProps.js";
import "./BaseFilter.js";

AGL.DisplacementFilter = class extends AGL.BaseFilter {
  constructor(
    texture,
    intensity,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    super(6, 0, intensity);

    this.textureProps = new AGL.FilterTextureProps(
      this,
      texture,
      translateX,
      translateY,
      cropX,
      cropY,
      cropWidth,
      cropHeight
    );
  }
}
