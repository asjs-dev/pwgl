import { FilterTextureProps } from "../data/props/FilterTextureProps.js";
import { BaseFilter } from "./BaseFilter.js";

export class DisplacementFilter extends BaseFilter {
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

    this.textureProps = new FilterTextureProps(
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
