import { FilterTextureProps } from "../data/props/FilterTextureProps.js";
import { BaseFilter } from "./BaseFilter.js";

export class MaskFilter extends BaseFilter {
  constructor(
    texture,
    type,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    super(7, 0, type);

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

  get type() {
    return this.v[0];
  }
  set type(v) {
    this.v[0] = v;
  }
}

MaskFilter.Type = {
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  ALPHA: 3,
  AVG: 4,
};
